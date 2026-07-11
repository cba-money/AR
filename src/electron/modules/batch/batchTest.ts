import { formatWorkbook } from "../formatter/formatFiles.js";
import { processARFile } from "../processor/processFiles.js";

/**
 * Takes an array of strings formatted as "mm/yyyy", strips the year,
 * and converts the month portions into an array of numbers.
 *
 * @param dates - Array of strings in "mm/yyyy" format
 * @returns Array of month numbers
 */
export function extractMonthsAsNumbers(dates: string[]): number[] {
  return dates.map(date => {
    // Split the string at the slash and grab the first element (the month)
    const [monthString] = date.split('/');
    
    // Parse the month string into a base-10 number
    return parseInt(monthString, 10);
  });
}

export function getLastThreeMonths(dateStr: string): string[] {
  // 1. Parse the mm/dd/yyyy string
  const [monthStr, , yearStr] = dateStr.split('/');
  
  // Convert to numbers. Subtract 1 from month because JS months are 0-indexed (0 = Jan, 11 = Dec)
  const targetMonth = parseInt(monthStr, 10) - 1; 
  const targetYear = parseInt(yearStr, 10);
  
  const result: string[] = [];
  
  // 2. Loop backwards from 2 months ago down to 0 (the current month)
  for (let i = 2; i >= 0; i--) {
    // Always instantiate on day 1 to prevent day-overflow roll-over bugs
    const date = new Date(targetYear, targetMonth, 1);
    
    // JS natively handles negative values or wrapping years when adjusting months
    date.setMonth(date.getMonth() - i);
    
    // 3. Format back to MM/YYYY string
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
    const formattedYear = date.getFullYear();
    
    result.push(`${formattedMonth}/${formattedYear}`);
  }
  
  return result;
}

export class BatchTest{
    private files: string[];
    private arDate: string;
    private monthRange: string[]; 

    private logs: string[] = [];
    private outputtedFiles: string[] = [];


    constructor(arConfig: {
        files: string[];
        arDate: string;
        //monthRange: string | number[];
    }){
        this.files = arConfig.files;
        this.arDate = arConfig.arDate;
        this.monthRange = getLastThreeMonths(this.arDate);
    }

  private log(message: string, type: 'info' | 'error' | 'warn' = 'info'): void {
    const logEntry = `[${new Date().toISOString()}] [${type.toUpperCase()}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
    //this.ipcSender('batch-log-update', logEntry);
    // Callback function
  }

    public async execute(): Promise<void> {
        if (this.monthRange.length < 3) return;
        this.log(`Starting batch process for ${this.files.length} files...`);
        this.log(`A/R Date: ${this.arDate} | Range: ${this.monthRange[0]} to ${this.monthRange[2]}`);
        for(let i = 0; i < this.files.length; i++){
            const formatted = await formatWorkbook(
                this.files[i], 
                `${this.monthRange[0]},${this.monthRange[1]},${this.monthRange[2]}`, 
                this.arDate
            );

            if(!formatted || formatted == null) {
                this.log(`Error formating file ${(i+1).toString()} of ${this.files.length.toString()}`, 'error');
                return;
            }

            const processed = await processARFile(
                formatted, 
                new Date(this.arDate), 
                extractMonthsAsNumbers(this.monthRange)
            );
            
            console.table(processed);
            this.log(`Processed ${(i+1).toString()} of ${this.files.length.toString()} files in queue`);
            //console.log(`Processed ${(i+1).toString()} of ${this.files.length.toString()} files in queue`);
        }
        
        this.log(`Processing job complete.`);

        this.log(`Generating summary and reports...`);

        this.log(`Summary and reports completed. Finishing up.`);

    }

}