import ExcelJS from "exceljs";
import path from "path";

// --- Helper Functions ---

/*
    Deep Clone Helper
    Helps copy style and formatting from source document
*/
export function deepClone<T>(obj: T): T {
    return obj
        ? JSON.parse(JSON.stringify(obj))
        : obj;
}

/* 
    Convert mm/dd/yyyy to mm.dd.yy
*/

export function convertDateFormat(dateStr: string): string {
  // Split the mm/dd/yyyy string into its individual components
  const [month, day, year] = dateStr.split('/');

  // Extract the last two digits of the year (e.g., "2026" becomes "26")
  const shortYear = year.slice(-2);

  // Recombine using dots as the separator
  return `${month}.${day}.${shortYear}`;
}

/*
    Pull Admin name from filename
*/
export function getAdminName(inputFile: string): string {
    const fileName = path.basename(inputFile);
    const match = fileName.match(/^(.*?)\s*-\s*Weekly/i);
    if (match) {
        return match[1].trim();
    }
    return "UNKNOWN";
}

/*
    Determine last day in user range
*/
export function getRangeEndingDate(
    dateRangeString: string
): string {

    const months = dateRangeString
        .split(",")
        .map(x => x.trim())
        .filter(Boolean)
        .map(item => {
            const [month, year] = item.split("/");
            return {
                month: parseInt(month),
                year: parseInt(year)
            };
        });

    if (!months.length) {
        return "";
    }

    months.sort((a, b) => {
        if (a.year !== b.year) {
            return a.year - b.year;
        }
        return a.month - b.month;
    });


    const last = months[months.length - 1];


    const lastDay = new Date(
        last.year,
        last.month,
        0
    );
    return `${last.month}/${lastDay.getDate()}/${last.year}`;
}

export function copyCellStyle(
    sourceCell: ExcelJS.Cell,
    targetCell: ExcelJS.Cell
): void {


    targetCell.style =
        deepClone(sourceCell.style);

    if (sourceCell.numFmt) {
        targetCell.numFmt =
            sourceCell.numFmt;
    }

    if (sourceCell.font) {
        targetCell.font =
            deepClone(sourceCell.font);
    }

    if (sourceCell.fill) {
        targetCell.fill =
            deepClone(sourceCell.fill);
    }

    if (sourceCell.border) {
        targetCell.border =
            deepClone(sourceCell.border);
    }

    if (sourceCell.alignment) {
        targetCell.alignment =
            deepClone(sourceCell.alignment);
    }

    if (sourceCell.protection) {
        targetCell.protection =
            deepClone(sourceCell.protection);
    }

}

export function copyCell(
    sourceCell: ExcelJS.Cell,
    targetCell: ExcelJS.Cell
): void {


    copyCellStyle(
        sourceCell,
        targetCell
    );

    const value = sourceCell.value;

    /*
        Shared Formula
    */
    if (
        value &&
        typeof value === "object" &&
        "sharedFormula" in value
    ) {

        targetCell.value =
            "result" in value
                ? value.result ?? 0
                : 0;

        return;
    }

    /*
        Normal Formula
    */
    if (
        value &&
        typeof value === "object" &&
        "formula" in value
    ) {

        targetCell.value =
            "result" in value &&
            value.result !== undefined &&
            value.result !== null
                ? value.result
                : 0;

        return;
    }
    targetCell.value = value;
}

export function parseMonthRanges(
    rangeString: string
): Set<string> {

    const allowed = new Set<string>();

    rangeString
        .split(",")
        .map(x => x.trim())
        .forEach(item => {

            const [month, year] =
                item.split("/");


            if (!month || !year) {
                return;
            }

            allowed.add(
                `${parseInt(month)}/${parseInt(year)}`
            );

        });
    return allowed;
}

export function excelDateToJSDate(
    value: ExcelJS.CellValue
): Date | null {

    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return value;
    }

    if (typeof value === "number") {

        const excelEpoch =
            new Date(Date.UTC(1899, 11, 30));

        return new Date(
            excelEpoch.getTime() +
            value * 86400000
        );

    }

    if (
        typeof value === "object" &&
        "result" in value &&
        value.result instanceof Date
    ) {
        return value.result;
    }

    const parsed =
        new Date(value.toString());


    return isNaN(parsed.getTime())
        ? null
        : parsed;

}

export function isYellowColor(
    argb?: string
): boolean {

    if (!argb) {
        return false;
    }

    argb =
        argb.replace(/^FF/i, "");

    if (argb.length !== 6) {
        return false;
    }

    const r =
        parseInt(argb.substring(0,2),16);

    const g =
        parseInt(argb.substring(2,4),16);

    const b =
        parseInt(argb.substring(4,6),16);

    return (
        r >= 180 &&
        g >= 180 &&
        b <= 150 &&
        Math.abs(r-g) <= 80
    );
}

export function rowContainsYellow(
    row: ExcelJS.Row
): boolean {

    let coloredCells = 0;
    row.eachCell(cell => {
        const fill = cell.fill;
        if (
            !fill ||
            !("fgColor" in fill)
        ) {
            return;
        }

        const rgb =
            fill.fgColor?.argb;


        if (isYellowColor(rgb)) {
            coloredCells++;
        }

    });

    return coloredCells >= 3;
}