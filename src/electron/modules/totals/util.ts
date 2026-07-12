/**
 * Converts an array of "MM/YYYY" date strings into a formatted human-readable range string.
 * @param dateStrings Array of dates in "MM/YYYY" format (e.g., ["05/2026", "07/2026", "06/2026"])
 * @returns A formatted range string (e.g., "May 2026 – July 2026") or empty string if input is empty.
 */
export function formatDateRange(dateStrings: string[]): string {
  if (!dateStrings || dateStrings.length === 0) {
    return '';
  }

  // 1. Parse "MM/YYYY" strings into real JavaScript Date objects
  const dates = dateStrings.map((str) => {
    const [month, year] = str.split('/').map(Number);
    // Setting day to 1. Note: JS months are 0-indexed (January is 0, December is 11)
    return new Date(year, month - 1, 1);
  });

  // 2. Sort chronologically to find the true min and max dates
  dates.sort((a, b) => a.getTime() - b.getTime());

  const earliestDate = dates[0];
  const latestDate = dates[dates.length - 1];

  // 3. Format using native Intl.DateTimeFormat for a clean "Month YYYY" output
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const startFormatted = formatter.format(earliestDate);
  const endFormatted = formatter.format(latestDate);

  // 4. Handle edge case: if all dates are within the same month/year
  if (startFormatted === endFormatted) {
    return startFormatted;
  }

  // Uses the standard en-dash (–) for ranges
  return `${startFormatted} – ${endFormatted}`;
}