export function getMonthRange(dateStr: string, months: number = 4): string[] {
  // 1. Parse the mm/dd/yyyy string
  const [monthStr, , yearStr] = dateStr.split('/');
  
  // Convert to numbers. Subtract 1 from month because JS months are 0-indexed (0 = Jan, 11 = Dec)
  const targetMonth = parseInt(monthStr, 10) - 1; 
  const targetYear = parseInt(yearStr, 10);
  
  const result: string[] = [];

  let monthsAdjusted = months - 1;
  
  // 2. Loop backwards from i months ago down to 0 (the current month)
  for (let i = monthsAdjusted; i >= 0; i--) {
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

export function generateLogEntry(logObject: ProcessLogEntry){
    return `[${logObject.entryDate.toISOString()}] [${logObject.type.toUpperCase()}] ${logObject.message}`;
}

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

const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export {
    wait
}