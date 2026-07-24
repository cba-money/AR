import path from 'path';
import fs from 'fs';

import { EventEmitter } from "events";

import {v4 as uuidv4} from 'uuid';

import { JSONFilePreset } from 'lowdb/node';

import { settingsManager } from './../../settings.js';

import {
  getMonthRange,
  extractMonthsAsNumbers,
  generateLogEntry,
  wait
} from './util.js';

import {
    convertDateFormat,
    createSpreadsheetFileName,
    getFormatterAdminName
} from './../../modules/formatter/utils.js';

import {
    getAdminName
} from './../../modules/processor/util.js';

import { generateTotals } from './../../modules/totals/generateTotals.js';
import { formatWorkbook } from "../../modules/formatter/formatFiles.js";
import { processARFile } from "../../modules/processor/processFiles.js";
import { writeLogFile } from './writeLog.js';

/*
Types of Events:
Event Code			Triggered When...							Ideal Payload Type
* start				The batch processing queue begins.			{ batchId: string, arDate: string, totalFiles: number, timestamp: number }
* fileStart			The processor begins working on a new file	{ filePath: string, fileName: string, index: number }
* fileSuccess		A file has been generated successfully.		{ filePath: string, outputPath: string, fileType: string }
* fileError			A file gen fails (but the batch continues).	{ filePath: string, error: string, index: number }
* progress			For updating UI elements like progress bars.{ percentage: number, processedCount: number, totalFiles: number, currentFile: string }
* complete			The entire batch finishes processing.		{ totalFiles: number, successCount: number, failCount: number, durationMs: number }
* error				A catastrophic error occurs that 			{ error: string }
					halts the entire batch
* cancel			The user explicitly cancels the batch		{ cancelTime: string }
*/

export interface BatchEvents {
  start: { totalFiles: number; batchId: string, arDate: string };
  fileStart: { fileName: string; index: number; filePath?: string; };
  fileSuccess: { filePath: string; fileName: string };
  fileError: { filePath: string; error: string };
  logUpdate: { entry: string };
  progress: { percentage: number; processedCount: number; totalFiles: number; currentFile: string };
  complete: { totalFiles: number; successCount: number; failCount: number };
  error: { error: string };
}

export class BatchJobRunner extends EventEmitter {

    // Batch Related Config
    private batchId: string;
    private runDate: Date;
    private endDate?: Date;
    private files: string[] = [];
    private arDate: string;
    private monthRange: string[];

    // User Settings
    private exportPath: string;

    // Outputs
    private totals: AdminTotal[];
    private grandTotal: number;
    private processedFiles: ProcessedFile[];

    // Job Process Metrics
    private fileStatus: ProcessedInputFile[];
    private percentage: number;
    private status: JobStatus;
    private logs: ProcessLogEntry[] = [];
    private currentFile: string;

    private currencyFormatter: Intl.NumberFormat;

    // Databases
    private latestJobDB: any;
    private jobDB: any;

    constructor(arConfig: {
        files: string[];
        arDate: string;
        //monthRange: string | number[];
    }){
        super();
        //this.batchId = "";
        // Generate a unique batch ID
        let batchId = uuidv4();
        this.batchId = batchId;
        this.runDate = new Date();
        this.arDate = arConfig.arDate;
        this.files = arConfig.files;
        this.status = 'Not Started';

        this.fileStatus = [];

        // Create file status table
        for(let i = 0; i < this.files.length; i++){
            const fileName = path.basename(this.files[i]);
            this.fileStatus.push({
                fullPath: this.files[i],
                fileName: fileName,
                index: i,
                status: 'Not Started'
            } as ProcessedInputFile);
        }

        this.monthRange = getMonthRange(this.arDate, 3);
        
        this.grandTotal = 0;
        this.percentage = 0;

        this.totals = [];
        this.processedFiles = [];
        this.currentFile = "";

        this.exportPath = path.join(
            settingsManager.get('defaultExportPath'),
            'export'
        );
        // create output path if one doesn't exist
        if (!fs.existsSync(this.exportPath)) {
            fs.mkdirSync(this.exportPath, { recursive: true });
        }

        this.currencyFormatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        this.latestJobDB = { job: {} };
    }

    public getLogs() {
        return [...this.logs];
    }

    public getInputFileStatus(){
        return this.fileStatus;
    }

    public getJobObject(){
        const jobObject = {
            jobId: this.batchId,
            status: this.status,
            processedFiles: this.processedFiles,
            startedAt: this.runDate,
            arDate: this.arDate
        };
        return jobObject;
    }

    public getJobObjectFull(){
        const jobObjectFull = {
            jobId: this.batchId,
            status: this.status,
            processedFiles: this.processedFiles,
            startedAt: this.runDate,
            completedAt: this.endDate,
            files: this.files,
            arDate: this.arDate,
            monthRange: this.monthRange,
            percentage: this.percentage,
            currentFile: this.currentFile,
            grandTotal: this.grandTotal,
            totals: this.totals,
            logs: this.logs
        } as ProcessingJobDatabase;
        return jobObjectFull;
    }

    public addTotal(admin: string, grandTotal: number, months: Record<number, number>){
        this.totals.push({
            admin: admin,
            grandTotal: grandTotal,
            arPerMonth: months
        } as AdminTotal);
    }

    public getBatchId(): string {
        return this.batchId;
    }

    public getRunDateTimestamp(): string {
        return this.runDate.toString();
    }

    public getRunDate(): Date{
        return this.runDate;
    }

    private log(message: string, type: 'info' | 'error' | 'warn' = 'info'): void {
        const logObject = {
            entryDate: new Date(),
            type: type,
            message: message
        } as ProcessLogEntry;
        this.logs.push(logObject);
        console.log(logObject);
        const logEntryString: string = generateLogEntry(logObject);
        this.emit('logUpdate', logObject);
    }

    private updatePercentage(percentIncrease: number){
        if(this.percentage >= 100) return false;
        this.percentage += percentIncrease;
        const percentUpdateResponse = {
            percentage: this.percentage,
            processedCount: this.processedFiles.length,
            totalFiles: this.files.length,
            currentFile: this.currentFile
        };
        this.emit('progress', percentUpdateResponse);
    }

    private async generateTotals(){
        const totalsPdf = await generateTotals({
          grandTotal: this.grandTotal,
          totalsByAdmin: this.totals
        }, new Date(this.arDate), this.monthRange, this.exportPath, this.batchId);
        this.log(`Generated totals PDF: ${totalsPdf ?? ``} | Grand Total: ${this.currencyFormatter.format(this.grandTotal)}`);
    }

    private addOutputFile(processedFile: ProcessedFile){
        this.processedFiles.push(processedFile);
        //this.log(`Finished processing ${outputFile}`);
    }

    private setCurrentFile(fileName: string, filePath: string, index: number){
        this.currentFile = path.basename(fileName);
        this.emit('fileStart', { 
            filePath: filePath, 
            fileName: fileName, 
            index: index 
        });
    }

    private async updateStatus(newStatus: JobStatus){
        this.status = newStatus;
        await this.updateLatestJob();
        this.log(`Job Status Updated To: ${this.status}`);
    }

    private async updateLatestJob(){
       const jobObject: ProcessingJobDatabase = this.getJobObjectFull();

        this.latestJobDB.data = {
            job: jobObject
        };

        await this.latestJobDB.write();
    }


   private async updateJobDB() {
        this.jobDB.data = {
            job: this.getJobObject()
        };

        await this.jobDB.write();
    }

    private async startPreProcess(){
        this.setCurrentFile("Pre-processing...", "", -1);

        // Store new batch start time
        let runDate = new Date();
        this.runDate = runDate;

        // create job db folder if one doesn't exist
        const jobDBLoc = path.join(
            process.cwd(),
            'db',
            'jobs'
        );

        if (!fs.existsSync(jobDBLoc)) {
            fs.mkdirSync(jobDBLoc, { recursive: true });
        }

        // Load latest job DB
        const defaultDataLatestJob = { job: this.getJobObject() };
        this.latestJobDB = await JSONFilePreset(path.join(
            jobDBLoc,
            'latest-job.json'
        ), defaultDataLatestJob);

        const defaultDataJob: ProcessingJobDatabase = this.getJobObjectFull();
        this.jobDB = await JSONFilePreset(path.join(
            jobDBLoc,
            `${this.batchId}.json`
        ), defaultDataJob);

        // Log Batch ID & A/R Date
        // This information is important to log in the log file
        this.log(`Batch ID: ${this.batchId} | Run Date: ${this.runDate.toString()}`);
        this.log(`A/R Date: ${this.arDate} | Range: ${this.monthRange[0]} to ${this.monthRange[this.monthRange.length-1]}`);

        this.log(`Starting pre-processing...`);

        // 2%
        this.updatePercentage(2);

        // Create export folder for batch
        const newExportPath = path.join(
            this.exportPath,
            this.batchId
        );
        this.exportPath = newExportPath;
        // create job folder if one doesn't exist
        if (!fs.existsSync(this.exportPath)) {
            fs.mkdirSync(this.exportPath, { recursive: true });
        }
        this.log(`Using export path: ${newExportPath}`);



        // TODO: Update DB - Add new Job, update "Latest Job"
        await this.updateLatestJob();
        await this.updateJobDB();


        this.log(`Pre-processing complete. Starting main process loop. | Files in queue: ${this.files.length}`);
        
        // 7%
        this.updatePercentage(5);

        return;
    }

    private async startPostProcess(successCount: number, failCount: number){
        this.setCurrentFile("Post-processing...", "", -2);
        this.log(`Starting post-processing...`);

        this.log(`All files processed. Successful: ${successCount} | Failed: ${failCount}`);
        this.updatePercentage(3);

        this.log(`Generating totals summary and reports...`);
        this.setCurrentFile("Generating Totals Sheet...", "", -3);

        await this.generateTotals();
        this.updatePercentage(4);

        this.log(`Summary and reports completed. Generating log file.`);
        this.setCurrentFile("Finishing Up...", "", -4);
        this.updatePercentage(1);

        await writeLogFile(this.logs, this.batchId, this.exportPath);
        this.updatePercentage(1);

        this.setCurrentFile("Job Complete", "", -5);
        this.updateStatus('Completed');
        this.endDate = new Date();

        // Final update to hit 100%
        this.updatePercentage(1);

        // TODO: Write processed job to database
        await this.updateLatestJob();
        await this.updateJobDB();

        // Pause for 250 miliseconds
        //await wait(250);

        return;
    }
    
    public async start(): Promise<void>{
        if(this.files.length <= 0) {
            this.updateStatus('Failed');
            this.emit("error", { error: "No input files provided." });
            //return;
        }

        while(this.status !== 'Cancelled' && this.status !== 'Failed'){

            const totalFiles = this.files.length;
            
            this.emit("start", {
                totalFiles: totalFiles,
                batchId: this.batchId,
                arDate: this.arDate
            });

            await this.startPreProcess();

            // How much % the file processing itself will take up.
            // 10% for pre-processing
            // 80% for file formatting/processing - 40%/40%
            // 10% for post-processing 
        
            const incrimentPercent = 80;
            const eachFileIncriment: number = Math.round(
                (1 / (this.files.length * 2)) * incrimentPercent 
            );

            this.updatePercentage(3);

            let successCount = 0;
            let failCount = 0;

            this.updateStatus('Processing');

            // Main process loop
            for (let i = 0; i < totalFiles; i++) {
                const file = this.files[i];
                
                //this.setCurrentFile(file, path.basename(file), i);
                const formatAdmin = getFormatterAdminName(file)
                const fileFriendlyDate = convertDateFormat(
                    this.arDate
                );
                const outputFileName = createSpreadsheetFileName(
                    formatAdmin,
                    fileFriendlyDate
                );
                this.setCurrentFile(outputFileName, path.join(this.exportPath, outputFileName), i);
                
                try{

                    // Format File
                    this.emit('fileStart', { fileName: path.basename(file), filePath: file, index: i });
                    this.fileStatus[i].status = "Processing";

                    const formatted = await formatWorkbook(
                        this.files[i], 
                        `${this.monthRange[0]},${this.monthRange[1]},${this.monthRange[2]}`, 
                        this.arDate,
                        this.exportPath
                    );

                    if(!formatted || formatted == null) {
                        this.log(`Error formating file ${i.toString()} of ${this.files.length.toString()}`, 'error');
                        this.fileStatus[i].status = "Failed";
                        failCount++;
                        continue;
                    }

                    this.log(`Formatted and generated xlsx file: ${formatted ?? ""}`);
                    this.addOutputFile({
                        admin: formatAdmin,
                        fileName: path.basename(formatted),
                        status: 'Completed',
                        fullPath: formatted,
                        type: 'xlsx'
                    } as ProcessedFile);
                    //this.emit('fileSuccess', { filePath: formatted, fileName: path.basename(formatted) });
                    this.updatePercentage(eachFileIncriment);

                    // Process File

                    const fileName = path.basename(formatted).replace('.xlsx', '-PROCESSED.pdf').replace('.csv', '-PROCESSED.pdf').replace(/ /g, "-");
                    const fileLoc = path.dirname(formatted);
                    const companyName = getAdminName(formatted);

                    this.log(`Starting processing of file ${fileName}`);
                    //this.emit('fileStart', { fileName: fileName, filePath: fileLoc, index: i });
                    this.setCurrentFile(fileName, path.join(fileLoc, fileName), i);

                    const processed = await processARFile(
                        formatted, 
                        new Date(this.arDate), 
                        extractMonthsAsNumbers(this.monthRange)
                    );

                    if(processed == null){
                        this.log(`Could not process file #${i.toString()}.`, 'error');
                        this.fileStatus[i].status = "Failed";
                        failCount++;
                        continue;
                    }

                    this.log(`Generated PDF: ${fileName} | Size: ${processed?.pdfSize}`);
                    this.addOutputFile({
                        admin: processed?.company,
                        fileName: fileName,
                        status: 'Completed',
                        fullPath: processed?.fileName,
                        type: 'pdf'
                    } as ProcessedFile);
                    this.emit('fileSuccess', { 
                        filePath: file, 
                        fileName: path.basename(file),
                        index: i
                    });

                    //Update Total for this administrator
                    this.addTotal(
                        processed?.company ?? 'Unknown',
                        processed?.grandTotal ?? 0,
                        processed?.monthlyTotals ?? []
                    );
                    this.grandTotal += processed?.grandTotal ?? 0;

                    this.log(`Finished processing A/R for: ${companyName}`);
                    this.log(`> Grant Total: ${this.currencyFormatter.format(processed?.grandTotal)} | Rows: ${processed.rows}`);
                    this.updatePercentage(eachFileIncriment);
                    this.fileStatus[i].status = "Completed";
                    successCount++;
                } catch (err){
                    this.fileStatus[i].status = "Failed";
                    this.emit('fileError', { filePath: file, error: err || 'Unknown Error' });
                    failCount++;
                }
            }

            await this.startPostProcess(successCount, failCount);

            this.emit('complete', { totalFiles: totalFiles, successCount, failCount });
            return;
        }

        if(this.status === "Failed"){
            await writeLogFile(this.logs, this.batchId, 'Cancelled');
            this.emit('error', {
                error: "Batch processing job failed with an unknown error. See logs."
            });
        }

        if(this.status === "Cancelled"){
            await writeLogFile(this.logs, this.batchId, 'Cancelled');
            this.emit('cancel', {
                cancelTime: this.endDate?.toISOString() ?? new Date().toISOString()
            });
        }
    }

    public async cancel(){
        this.endDate = new Date();
    }
}