import ExcelJS from "exceljs";
import path from "path";

import { settingsManager } from './../../settings.js';

import { deepClone,
    convertDateFormat,
    getAdminName,
    getRangeEndingDate,
    copyCell,
    parseMonthRanges,
    excelDateToJSDate,
    isYellowColor,
    rowContainsYellow
 } from './utils.js';

/*
    A/R Formatter
    v.0.3.0
    Isolates part of Weekly 7 Excel sheet and flattens formulas.
*/

export async function formatWorkbook(
    inputFile: string,
    dateRangeString: string,
    arDate: string,
    exportPath: string
): Promise<string> {

    const admin = getAdminName(inputFile);

    console.log(`Starting formatting of ${admin}...`);

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

    const fileFriendlyDate = convertDateFormat(
        arDate
    );

    const outputPath = path.join(
            exportPath,
            `${admin} ar to ${fileFriendlyDate}.xlsx`
    );

    console.log(`Generating formatted Excel file: ${outputPath}`);
    /*
    const outputPath =
        path.join(
            os.tmpdir(),
            `filtered-${Date.now()}.xlsx`
        );
    */

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