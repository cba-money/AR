import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';

import { generatePdfLocally } from './generatePdf.js';

import {
    getAdminName,
    parseDateString,
    parseCurrency,
    findCommissionColumn,
    getYellowColorCode
} from "./util.js";

// --- Main Processing Function ---

export async function processARFile(
    filePath: string, 
    givenDate: Date, 
    monthsToProcess: number[]
): Promise<ProcessResult | null> {
    
    console.log(`\n${'='.repeat(100)}\nPROCESSING: ${filePath}\n${'='.repeat(100)}`);
    
    const fileName = path.basename(filePath).replace('.xlsx', '-PROCESSED.pdf').replace('.csv', '-PROCESSED.pdf').replace(/ /g, "-");
    const fileLoc = path.dirname(filePath);
    const companyName = getAdminName(filePath);
    //const outputPdfPath = filePath.replace('.xlsx', '-PROCESSED.pdf').replace('.csv', '-PROCESSED.pdf').replace(/ /g, "-");
    const outputPdfPath = path.join(
        fileLoc,
        fileName
    );

    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
    } catch (e) {
        console.error("Failed to read Excel file", e);
        return null;
    }

    const ws = workbook.worksheets[0];
    if (!ws) return null;

    const commissionCol = findCommissionColumn(ws);
    if (!commissionCol) {
        console.log("✗ No Commission column found");
        return null;
    }
    console.log(`✓ Commission column: Column ${commissionCol}`);

    const yellowCode = getYellowColorCode(ws);
    console.log(`✓ Yellow color code identified: ${yellowCode}`);

    const commPlus1 = commissionCol + 1;
    const commPlus4 = commissionCol + 4;

    const dataRows: RowData[] = [];

    for (let rowNum = 3; rowNum <= ws.rowCount; rowNum++) {
        const row = ws.getRow(rowNum);
        
        const cellC = row.getCell(3);
        const cellF = row.getCell(commPlus1);
        const cellI = row.getCell(commPlus4);
        
        let isYellow = false;
        const fill = cellC.fill as ExcelJS.FillPattern;
        if (fill && fill.type === 'pattern' && fill.fgColor?.argb) {
            const color = fill.fgColor.argb.toUpperCase();
            if (color === yellowCode.toUpperCase() || color.includes('FFFF')) {
                isYellow = true;
            }
        }

        if (!isYellow) continue;

        let futureDeducted = false;
        const colIValue = cellI.value ? String(cellI.value) : '';
        const colFValue = cellF.value;

        if (colIValue.includes('DEDUCTED')) {
            const datePart = colIValue.split('DEDUCTED').pop()?.split('-')[0]?.trim();
            if (datePart) {
                const deductDate = parseDateString(datePart);
                if (!deductDate) {
                    throw new Error(`Row ${rowNum}: DEDUCTED present but date could not be parsed from '${colIValue}'`);
                }
                if (deductDate <= givenDate) continue;
                futureDeducted = true;
            }
        }

        if (!futureDeducted) {
            const colFStr = String(colFValue || '').toUpperCase();
            if (colFStr.includes('VOID') || colFStr.includes('REJECTED')) continue;

            if (colFValue instanceof Date && colFValue <= givenDate) continue;
            if (colIValue && colFValue instanceof Date && colFValue <= givenDate) continue;
        }

        const cellsData: CellData[] = [];
        for (let colNum = 1; colNum <= commissionCol; colNum++) {
            const cell = row.getCell(colNum);
            cellsData.push({
                value: cell.value,
                format: colNum === 1 ? (cell.numFmt || null) : null
            });
        }

        dataRows.push({
            rowNum,
            cells: cellsData,
            dateFormat: cellsData[0].format
        });
    }

    console.log(`✓ Rows kept after filtering: ${dataRows.length}`);

    // Sort Data
    const dataForSort: SortableRow[] = dataRows.map((rowData, idx) => {
        const dateVal = rowData.cells[0]?.value;
        const parsedDate = dateVal instanceof Date ? dateVal : new Date(Date.UTC(2099, 0, 1));
        const dealerVal = rowData.cells[2]?.value ? String(rowData.cells[2].value) : '';
        const contractVal = rowData.cells[3]?.value ? String(rowData.cells[3].value) : '';

        return { idx, date: parsedDate, dealer: dealerVal, contract: contractVal, rowData };
    });

    dataForSort.sort((a, b) => {
        if (a.date.getTime() !== b.date.getTime()) return a.date.getTime() - b.date.getTime();
        if (a.dealer !== b.dealer) return a.dealer.localeCompare(b.dealer);
        return a.contract.localeCompare(b.contract);
    });

    const rowsSorted = dataForSort.map(item => item.rowData);
    
    // Aggregations
    const monthlyTotals: Record<number, number> = {};
    monthsToProcess.forEach(m => monthlyTotals[m] = 0.0);

    let directSum = 0.0;

    rowsSorted.forEach(row => {
        const dateVal = row.cells[0]?.value;
        const commVal = row.cells[commissionCol - 1]?.value;
        
        if (dateVal instanceof Date && commVal !== undefined && commVal !== null) {
            const month = dateVal.getUTCMonth() + 1; // ✨ FIXED: Use getUTCMonth() to stop local shifts
            const commNum = parseCurrency(commVal);

            if (monthlyTotals.hasOwnProperty(month)) {
                monthlyTotals[month] += commNum;
            }
        }
        
        if (commVal !== undefined && commVal !== null) {
            directSum += parseCurrency(commVal);
        }
    });

    const monthlySum = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);
    const grandTotal = monthlySum; 

    console.log(`✓ Verification:`);
    console.log(`  - Direct sum of commissions:  $${directSum.toFixed(2)}`);
    console.log(`  - Sum of monthly totals:      $${monthlySum.toFixed(2)}`);
    console.log(`  - Grand total:                $${grandTotal.toFixed(2)}`);

    if (Math.abs(directSum - monthlySum) > 0.01 || Math.abs(directSum - grandTotal) > 0.01) {
        console.log(`✗ VERIFICATION FAILED - Totals don't match!`);
        return null;
    }

    const monthNames: Record<number, string> = {
        1: 'JANUARY', 2: 'FEBRUARY', 3: 'MARCH', 4: 'APRIL',
        5: 'MAY', 6: 'JUNE', 7: 'JULY', 8: 'AUGUST',
        9: 'SEPTEMBER', 10: 'OCTOBER', 11: 'NOVEMBER', 12: 'DECEMBER'
    };

    let htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: Arial, sans-serif; font-size: 10pt; margin: 15px; }
h2 { margin-top: 0; margin-bottom: 15px; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #999; padding: 6px; text-align: left; font-size: 10pt; }
th { background-color: #333; color: white; font-weight: bold; }
tr:nth-child(even) { background-color: #f9f9f9; }
.total-row { font-weight: bold; background-color: #e8e8e8; border-top: 3px solid #000; border-bottom: 3px solid #000; }
.grand-total { font-weight: bold; background-color: #d0d0d0; border-top: 3px solid #000; border-bottom: 3px solid #000; }
.number { text-align: right; font-family: monospace; }
</style>
</head>
<body>
<h2>${companyName} A/R to ${givenDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', timeZone: 'UTC' })}</h2>
<table>
<tr><th>Date</th><th>Agent</th><th>Dealer</th><th>Contract</th><th>Commission</th></tr>
`;

    const monthsAdded = new Set<number>();

    rowsSorted.forEach((rowData, idx) => {
        const cells = rowData.cells;
        const dateVal = cells[0]?.value;
        
        // ✨ FIXED: Force toLocaleDateString to output the date in UTC format
        const dateStr = dateVal instanceof Date 
            ? dateVal.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', timeZone: 'UTC' }) 
            : String(dateVal || '');
            
        const agentStr = cells[1]?.value ? String(cells[1].value) : '';
        const dealerStr = cells[2]?.value ? String(cells[2].value) : '';
        const contractStr = cells[3]?.value ? String(cells[3].value) : '';
        
        const commVal = cells[commissionCol - 1]?.value;
        const commStr = typeof commVal === 'number' || !isNaN(parseCurrency(commVal)) 
            ? parseCurrency(commVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
            : String(commVal || '');

        htmlContent += `<tr><td>${dateStr}</td><td>${agentStr}</td><td>${dealerStr}</td><td>${contractStr}</td><td class="number">${commStr}</td></tr>\n`;

        const currentMonth = dateVal instanceof Date ? dateVal.getUTCMonth() + 1 : null; // ✨ FIXED: getUTCMonth()
        let nextMonth: number | null = null;
        
        if (idx + 1 < rowsSorted.length) {
            const nextDate = rowsSorted[idx + 1].cells[0]?.value;
            nextMonth = nextDate instanceof Date ? nextDate.getUTCMonth() + 1 : null; // ✨ FIXED: getUTCMonth()
        }

        if (currentMonth && (nextMonth === null || nextMonth !== currentMonth)) {
            if (!monthsAdded.has(currentMonth) && monthsToProcess.includes(currentMonth)) {
                const monthTotal = monthlyTotals[currentMonth] || 0;
                const formattedTotal = monthTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                htmlContent += `<tr class="total-row"><td>${monthNames[currentMonth]}</td><td></td><td></td><td></td><td class="number">${formattedTotal}</td></tr>\n`;
                monthsAdded.add(currentMonth);
            }
        }
    });

    const formattedGrandTotal = grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    htmlContent += `<tr class="grand-total"><td>GRAND TOTAL</td><td></td><td></td><td></td><td class="number">${formattedGrandTotal}</td></tr>\n`;
    htmlContent += '</table></body></html>';

    try {
        await generatePdfLocally(htmlContent, outputPdfPath);
        
        if (fs.existsSync(outputPdfPath)) {
            const pdfSize = fs.statSync(outputPdfPath).size;
            console.log(`✓ PDF created: ${path.basename(outputPdfPath)} (${pdfSize.toLocaleString()} bytes)`);
            
            return {
                company: companyName,
                rows: rowsSorted.length,
                grandTotal: grandTotal,
                totalCommission: directSum,
                monthlyTotals: monthlyTotals,
                pdfSize: pdfSize,
                fileName: outputPdfPath
            };
        } else {
            console.log(`✗ PDF creation failed (File not found after generation)`);
            return null;
        }
    } catch (error) {
        console.error(`✗ Error generating PDF:`, error);
        return null;
    }
}