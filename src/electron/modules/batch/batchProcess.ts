import * as fs from 'fs/promises';
import * as path from 'path';
//import { BatchConfig, Totals, ProgressState, FileTotals, BatchResults } from './types';

// Define the shape of our IPC callback
type IpcSender = (channel: string, data: any) => void;

export class BatchProcessor {
  private files: string[];
  private arDate: string;
  private monthRange: any;
  private ipcSender: IpcSender;
  
  private logs: string[] = [];
  private outputtedFiles: string[] = [];
  private totals: Totals = {
    admins: {},
    arPerMonth: {}
  };

  constructor(config: BatchConfig, ipcSender: IpcSender) {
    this.files = config.files;
    this.arDate = config.arDate;
    this.monthRange = config.monthRange;
    this.ipcSender = ipcSender;
  }

  // --- Utility Methods ---
  
  private log(message: string, type: 'info' | 'error' | 'warn' = 'info'): void {
    const logEntry = `[${new Date().toISOString()}] [${type.toUpperCase()}] ${message}`;
    this.logs.push(logEntry);
    this.ipcSender('batch-log-update', logEntry);
  }

  private updateProgress(currentIndex: number): void {
    const totalFiles = this.files.length;
    const progress: ProgressState = {
      currentFile: this.files[currentIndex],
      processedCount: currentIndex + 1,
      totalFiles: totalFiles,
      percentage: Math.round(((currentIndex + 1) / totalFiles) * 100)
    };
    this.ipcSender('batch-progress-update', progress);
  }

  // --- Pipeline Methods ---

  private async runFormatter(filePath: string): Promise<any> {
    this.log(`Formatting: ${filePath}`);
    // Replace `any` with your actual formatted data interface when built
    return { /* formatted data */ };
  }

  private async runProcessor(formattedData: any, filePath: string): Promise<FileTotals> {
    this.log(`Processing: ${filePath}`);
    // Mock processing logic
    return { admin: 'AdminA', amount: 1500, month: '2026-07' }; 
  }

  private aggregateTotals(fileTotals: FileTotals): void {
    if (!this.totals.admins[fileTotals.admin]) {
      this.totals.admins[fileTotals.admin] = 0;
    }
    this.totals.admins[fileTotals.admin] += fileTotals.amount;

    if (!this.totals.arPerMonth[fileTotals.month]) {
      this.totals.arPerMonth[fileTotals.month] = 0;
    }
    this.totals.arPerMonth[fileTotals.month] += fileTotals.amount;
  }

  // --- Main Execution ---

  public async execute(): Promise<void> {
    this.log(`Starting batch process for ${this.files.length} files...`);
    this.log(`A/R Date: ${this.arDate} | Range: ${this.monthRange.start} to ${this.monthRange.end}`);

    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      try {
        const formattedData = await this.runFormatter(file);
        const fileTotals = await this.runProcessor(formattedData, file);
        
        this.aggregateTotals(fileTotals);
        
        const outputPath = path.join('/output/directory', `processed_${path.basename(file)}`);
        this.outputtedFiles.push(outputPath);

      } catch (error: any) {
        this.log(`Error processing ${file}: ${error.message || 'Unknown error'}`, 'error');
      }

      this.updateProgress(i);
    }

    await this.finalize();
  }

  private async finalize(): Promise<void> {
    this.log('Batch processing complete. Generating totals and log files...');

    const totalsOutputPath = '/output/directory/totals.json';
    await fs.writeFile(totalsOutputPath, JSON.stringify(this.totals, null, 2));
    this.outputtedFiles.push(totalsOutputPath);

    const logOutputPath = '/output/directory/batch_run.log';
    await fs.writeFile(logOutputPath, this.logs.join('\n'));
    this.outputtedFiles.push(logOutputPath);

    const results: BatchResults = {
      totals: this.totals,
      logs: this.logs,
      outputtedFiles: this.outputtedFiles
    };
    
    this.ipcSender('batch-complete', results);
  }
}