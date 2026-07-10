import ExcelJS from "exceljs";
import path from "path";
import os from "os";

/*
    Deep Clone Helper
    Helps copy style and formatting from source document
*/
function deepClone<T>(obj: T): T {
    return obj
        ? JSON.parse(JSON.stringify(obj))
        : obj;
}

/*
    Pull Admin name from filename
*/
function getAdminName(inputFile: string): string {
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
function getRangeEndingDate(
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

function copyCellStyle(
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

function copyCell(
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

function parseMonthRanges(
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

function excelDateToJSDate(
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

function isYellowColor(
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

function rowContainsYellow(
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

export async function formatWorkbook(
    inputFile: string,
    dateRangeString: string
): Promise<string> {

    console.log("Starting processing...");

    const allowedMonths =
        parseMonthRanges(dateRangeString);

    const workbook =
        new ExcelJS.Workbook();


    await workbook.xlsx.readFile(inputFile);

    const outputWorkbook =
        new ExcelJS.Workbook();

    const outputSheet =
        outputWorkbook.addWorksheet(
            "Filtered Results"
        );

    let headerWritten = false;
    let newestSheet:
        ExcelJS.Worksheet | null = null;
    let newestYear = 0;

    workbook.eachSheet(sheet => {
        const match =
            sheet.name.match(/\b(20\d{2})\b/);
        if (!match) {
            return;
        }
        const year =
            parseInt(match[1]);
        if (year > newestYear) {
            newestYear = year;
            newestSheet = sheet;
        }
    });

    if (!newestSheet) {
        throw new Error(
            "Could not find valid year worksheet"
        );
    }

    workbook.eachSheet(sheet => {
        if (!/\b20\d{2}\b/.test(sheet.name)) {
            return;
        }
        sheet.eachRow((row,rowNumber)=>{
            if(rowNumber===1){
                if(!headerWritten){
                    const headerRow =
                        newestSheet!.getRow(1);

                    const outputHeader =
                        outputSheet.getRow(1);

                    for(
                        let col=1;
                        col<=newestSheet!.columnCount;
                        col++
                    ){

                        copyCell(
                            headerRow.getCell(col),
                            outputHeader.getCell(col)
                        );
                    }
                    headerWritten=true;
                }
                return;
            }

            const reportDate =
                excelDateToJSDate(
                    row.getCell(1).value
                );

            if(!reportDate){
                return;
            }

            const monthKey =
                `${reportDate.getUTCMonth()+1}/${reportDate.getUTCFullYear()}`;

            if(!allowedMonths.has(monthKey)){
                return;
            }

            if(!rowContainsYellow(row)){
                return;
            }

            const newRow =
                outputSheet.getRow(
                    outputSheet.rowCount + 1
                );

            for(
                let col=1;
                col<=sheet.columnCount;
                col++
            ){
                copyCell(
                    row.getCell(col),
                    newRow.getCell(col)
                );

            }
            newRow.height=row.height;
        });

    });

    const outputPath =
        path.join(
            os.tmpdir(),
            `filtered-${Date.now()}.xlsx`
        );

    outputSheet.spliceRows(
        1,
        0,
        [
            `${getAdminName(inputFile)} A/R to ${getRangeEndingDate(dateRangeString)}`
        ]
    );

    const titleRow =
        outputSheet.getRow(1);

    titleRow.font = {
        bold:true,
        size:14
    };

    titleRow.alignment = {
        horizontal:"center"
    };

    outputWorkbook.calcProperties = {
        fullCalcOnLoad:true
    };

    await outputWorkbook.xlsx.writeFile(
        outputPath
    );

    return outputPath;

}