import path from 'path';
import fs from 'fs';

import {v4 as uuidv4} from 'uuid';

import { formatWorkbook } from "../formatter/formatFiles.js";
import { processARFile } from "../processor/processFiles.js";

import { settingsManager } from './../../settings.js';

import { generateTotals } from './../totals/generateTotals.js';
import { writeLogFile } from './writeLog.js';

import {
  extractMonthsAsNumbers,
  getLastThreeMonths
} from './util.js';

import { WebContents } from 'electron';

import { ipcWebContentsSend } from "./../../util.js";

type IpcSender = (data: any) => void;

export class BatchTest{
    private batchId: string;
    private runDate: Date;
    private files: string[];
    private arDate: string;
    private monthRange: string[]; 

    private logs: string[] = [];
    private exportPath: string;
    private outputtedFiles: string[] = [];
    private totals: Total[];
    private grandTotal: number;
    private totalCommission: number;

    private percentage: number;

    //private logSender: IpcSender;
    private webContents: WebContents;

    constructor(arConfig: {
        files: string[];
        arDate: string;
        //monthRange: string | number[];
    }, webContents: WebContents){
        let batchId = uuidv4();
        this.batchId = batchId;
        let runDate = new Date();
        this.runDate = runDate;
        this.files = arConfig.files;
        this.arDate = arConfig.arDate;
        this.monthRange = getLastThreeMonths(this.arDate);
        this.grandTotal = 0;
        this.totalCommission = 0;
        this.totals = [];
        //this.exportPath = settingsManager.get('defaultExportPath');
        this.exportPath = path.join(
          settingsManager.get('defaultExportPath'),
          'export',
          this.batchId
        );
        if (!fs.existsSync(this.exportPath)) {
            fs.mkdirSync(this.exportPath, { recursive: true });
        }
        //this.logSender = logCallback;
        this.webContents = webContents;
        this.percentage = 0;
  }

  public addTotal(admin: string, grandTotal: number, months: Record<number, number>){
    this.totals.push({
      adminName: admin,
      grandTotal: grandTotal,
      arPerMonth: months
    } as Total)
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

  public addOutputFile(outputFile: string | undefined){
    if(outputFile !== null && outputFile !== undefined){
      this.outputtedFiles.push(outputFile);
    }
    this.log(`Finished processing ${outputFile}`);
  }

  private log(message: string, type: 'info' | 'error' | 'warn' = 'info'): void {
    const logEntry = `[${new Date().toISOString()}] [${type.toUpperCase()}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
    //this.logSender(logEntry);
    ipcWebContentsSend(
        "batchLog",
        this.webContents,
        {
            level: type,
            message: logEntry,
            timestamp: new Date().toISOString()
        }
    );
    //this.ipcSender('batch-log-update', logEntry);
    // Callback function
  }

  private updatePercentage(percentIncrease: number){
    if(this.percentage < 100){
      this.percentage += percentIncrease;
      const percent = { percent: this.percentage };
      ipcWebContentsSend(
        "batchProgress",
        this.webContents,
        percent
      );
    }
  }

  public async execute(): Promise<void> {
        if (this.monthRange.length < 3) return;
        this.log(`Starting batch process for ${this.files.length} files...`);
        this.updatePercentage(5);
        this.log(`Batch ID: ${this.batchId} | Run Date: ${this.runDate.toString()}`);
        this.log(`A/R Date: ${this.arDate} | Range: ${this.monthRange[0]} to ${this.monthRange[2]}`);
        // Get percent incriment
        let incrimentPercent = 80;

        if(this.files.length > 0) incrimentPercent = 100 / this.files.length;

        this.updatePercentage(5);

        for(let i = 0; i < this.files.length; i++){
          try{
            const formatted = await formatWorkbook(
                this.files[i], 
                `${this.monthRange[0]},${this.monthRange[1]},${this.monthRange[2]}`, 
                this.arDate,
                this.exportPath
            );

            if(!formatted || formatted == null) {
                this.log(`Error formating file ${i.toString()} of ${this.files.length.toString()}`, 'error');
                return;
            } else {
              this.log(`Formatted and generated xlsx file: ${formatted ?? ""}`);
            }

            this.log(`Starting processing of file #${i.toString()}${(i+1).toString()}`);

            const processed = await processARFile(
                formatted, 
                new Date(this.arDate), 
                extractMonthsAsNumbers(this.monthRange)
            );
            
            if(processed == null){
              this.log(`Could not process file #${i.toString()}.`, 'error');
              return;
            }

            if(processed !== null){
              this.log(`Generated PDF: ${processed?.fileName} | Size: ${processed?.pdfSize}`);
              this.addOutputFile(processed?.fileName);
              this.addTotal(
                processed?.company ?? 'Unknown',
                processed?.grandTotal ?? 0,
                processed?.monthlyTotals ?? []
              );
              this.grandTotal += processed?.grandTotal ?? 0;
              this.totalCommission += processed?.totalCommission ?? 0;

              console.table(processed);
              this.log(`Processed ${(i+1).toString()} of ${this.files.length.toString()} files in queue. Admin: ${processed?.company}.`);
              this.updatePercentage(incrimentPercent);
            }
          }
          catch(error){
            this.log(`An error occured: ${error}`, 'error');
          }
            
        }
        
        this.log(`Processing job complete.`);
        this.updatePercentage(4);

        this.log(`Generating summary and reports...`);

        const totalsPdf = await generateTotals({
          grandTotal: this.grandTotal,
          totalCommission: this.totalCommission,
          totalsByAdmin: this.totals
        }, new Date(this.arDate), this.monthRange, this.exportPath, this.batchId);
        this.log(`Generated totals PDF: ${totalsPdf ?? ``}`);
        this.updatePercentage(4);

        this.log(`Summary and reports completed. Generating log file.`);
        
        this.updatePercentage(1);
        await writeLogFile(this.logs, this.batchId, this.exportPath);
        this.updatePercentage(1);

        return;

    }

}