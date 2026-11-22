
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

/**
 * Parses the A/R date ("MM/DD/YYYY") the way the legacy app does
 * (datetime.strptime(value, "%m/%d/%Y")): a calendar date with no time zone.
 *
 * The result is midnight UTC so it compares correctly against spreadsheet dates, which
 * ExcelJS also reports as midnight UTC. `new Date("MM/DD/YYYY")` must not be used for
 * this: it yields local midnight, which is hours away from the cell values.
 */
export function parseArDate(dateStr: string): Date {
  const match = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid A/R date "${dateStr}". Expected MM/DD/YYYY.`);
  }

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`Invalid A/R date "${dateStr}". Expected MM/DD/YYYY.`);
  }
  return date;
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