
export function buildMonthRangeString(monthRange: string[]): string {
  let fullString = '';
  for (let i = 0; i < monthRange.length; i++) {
    fullString += monthRange[i];
    if (i < monthRange.length - 1) {
      fullString += ',';
    }
  }
  return fullString;
}

export function getMonthRange(dateStr: string, monthsBack: number = 3): string[] {
  const [monthStr, , yearStr] = dateStr.split('/');

  const targetMonth = parseInt(monthStr, 10) - 1;
  const targetYear = parseInt(yearStr, 10);

  const result: string[] = [];

  for (let i = monthsBack; i >= 0; i--) {
    const date = new Date(targetYear, targetMonth, 1);

    date.setMonth(targetMonth - i);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    result.push(`${month}/${year}`);
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