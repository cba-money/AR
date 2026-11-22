import * as path from 'path';
import ExcelJS from 'exceljs';

import {
    PyValue,
    toPyValue,
    pyTruthy,
    pyIsNumber,
    pyStr,
    pyStrip,
    pyCompareStr,
    pyFloat,
    pySum,
    pyFormatMoney,
    pyStrftimeMDY,
    pyParseDeductDate,
    secureFilename
} from './pyCompat.js';

/*
    A/R Processor – report builder
    ------------------------------
    Line-for-line port of process_excel_to_pdf() in ar-app/app.py (system v2.1.2a).
    The Python statement being reproduced is quoted above each block; do not "tidy" the
    logic here without changing the legacy script too, or the two will drift apart again.

    All dates are naive (no time zone), exactly like Python's datetime: they are held as
    Date objects whose UTC fields carry the calendar value. `givenDate` must therefore be
    midnight UTC of the A/R date (see parseArDate in lib/batch/util.ts).
*/

export const PROCESSOR_RULESET = '2.1.2a';

export interface ARReport {
    company: string;
    rows: number;
    grandTotal: number;
    totalCommission: number;
    monthlyTotals: Record<number, number>;
    html: string;
}

interface ReportRow {
    rowNum: number;
    cells: PyValue[];
}

const MONTH_NAMES: Record<number, string> = {
    1: 'JANUARY', 2: 'FEBRUARY', 3: 'MARCH', 4: 'APRIL',
    5: 'MAY', 6: 'JUNE', 7: 'JULY', 8: 'AUGUST',
    9: 'SEPTEMBER', 10: 'OCTOBER', 11: 'NOVEMBER', 12: 'DECEMBER'
};

const FALLBACK_SORT_DATE = Date.UTC(2099, 0, 1); // datetime(2099, 1, 1)

/**
 * extract_company_name(): the Flask upload handler stores the file as
 * "<uuid>_<secure_filename(name)>" and the report title is the second "_"-separated part,
 * i.e. everything before the first space/underscore of the uploaded file name.
 */
export function extractCompanyName(filePath: string): string {
    return secureFilename(path.basename(filePath)).split('_')[0];
}

/** ws.cell(row, col).value without creating cells in the worksheet. */
function cellValue(ws: ExcelJS.Worksheet, rowNum: number, colNum: number): PyValue {
    return toPyValue(ws.findRow(rowNum)?.findCell(colNum));
}

/**
 * str(fill.start_color.rgb) for column C, or null where openpyxl has no RGB string
 * (theme / indexed colours).
 */
function startColorRgb(ws: ExcelJS.Worksheet, rowNum: number): string | null {
    const fill = ws.findRow(rowNum)?.findCell(3)?.fill as ExcelJS.Fill | undefined;
    if (!fill) return '00000000';
    if (fill.type !== 'pattern') {
        // Python raises AttributeError here, which aborts the whole file.
        throw new Error("'GradientFill' object has no attribute 'start_color'");
    }
    const color = fill.fgColor;
    if (!color) return '00000000';
    if (typeof color.argb !== 'string') return null;
    return color.argb.length === 6 ? `00${color.argb}` : color.argb;
}

/** find_commission_column(): first header in row 2 that contains "commission". */
export function findCommissionColumn(ws: ExcelJS.Worksheet): number | null {
    for (let colNum = 1; colNum <= ws.columnCount; colNum++) {
        const header = cellValue(ws, 2, colNum);
        if (pyTruthy(header) && pyStr(header).toLowerCase().includes('commission')) {
            return colNum;
        }
    }
    return null;
}

/** float(v) if isinstance(v, (int, float)) else float(str(v).replace('$', '').replace(',', '')) */
function commissionToNumber(value: PyValue): number {
    if (pyIsNumber(value)) return Number(value);
    return pyFloat(pyStr(value).split('$').join('').split(',').join(''));
}

export async function buildARReport(
    filePath: string,
    givenDate: Date,
    monthsToProcess: number[]
): Promise<ARReport> {

    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
    } catch (e) {
        throw new Error('Failed to read Excel file');
    }

    // ws = wb.active
    const activeTab = workbook.views?.[0]?.activeTab ?? 0;
    const ws = workbook.worksheets[activeTab] ?? workbook.worksheets[0];
    if (!ws) throw new Error('Workbook has no worksheets');

    const commissionCol = findCommissionColumn(ws);
    if (!commissionCol) {
        throw new Error('✗ No Commission column found');
    }

    const commPlus1 = commissionCol + 1;
    const commPlus4 = commissionCol + 4;
    const given = givenDate.getTime();
    const maxRow = ws.rowCount;

    const dataRows: ReportRow[] = [];

    for (let rowNum = 3; rowNum <= maxRow; rowNum++) {
        const colFValue = cellValue(ws, rowNum, commPlus1);
        const colIValue = cellValue(ws, rowNum, commPlus4);

        // is_yellow: str(color) == yellow_code or 'FFFF' in str(color).upper()
        // (get_yellow_color_code() only ever returns a code containing 'FFFF', so the
        //  first half of that test can never add a row the second half misses.)
        const color = startColorRgb(ws, rowNum);
        if (color === null || !color.toUpperCase().includes('FFFF')) {
            continue;
        }

        // DEDUCTED check FIRST. A future DEDUCTED date protects the row:
        // keep it immediately and skip all later deletion checks.
        let futureDeducted = false;

        // if col_i_value and 'DEDUCTED' in str(col_i_value):
        if (pyTruthy(colIValue) && pyStr(colIValue).includes('DEDUCTED')) {
            // str(col_i_value).split('DEDUCTED')[-1].strip().split('-')[0].strip()
            const afterLast = pyStr(colIValue).split('DEDUCTED').pop() as string;
            const datePart = pyStrip(pyStrip(afterLast).split('-')[0]);
            const deductDate = pyParseDeductDate(datePart);
            if (deductDate === null) {
                // Python raises ValueError, so the legacy app produces no PDF for this file.
                throw new Error(
                    `Row ${rowNum}: DEDUCTED present but date could not be parsed ` +
                    `from '${pyStr(colIValue)}' (extracted '${datePart}')`
                );
            }
            if (deductDate.getTime() <= given) {
                continue;
            }
            futureDeducted = true;
        }

        if (!futureDeducted) {
            // if col_f_value and ('VOID' in str(col_f_value).upper() or 'REJECTED' in ...)
            if (pyTruthy(colFValue)) {
                const upper = pyStr(colFValue).toUpperCase();
                if (upper.includes('VOID') || upper.includes('REJECTED')) continue;
            }

            // if col_f_value and isinstance(col_f_value, datetime) and col_f_value <= given_date
            // (the third legacy test is the same condition with an extra requirement)
            if (colFValue instanceof Date && colFValue.getTime() <= given) continue;
        }

        const cells: PyValue[] = [];
        for (let colNum = 1; colNum <= commissionCol; colNum++) {
            cells.push(cellValue(ws, rowNum, colNum));
        }
        dataRows.push({ rowNum, cells });
    }

    // data_for_sort.sort(key=lambda x: (x['date'], x['dealer'], x['contract']))
    const sortable = dataRows.map(row => {
        const dateVal = row.cells[0];
        const dealerVal = row.cells.length > 2 ? row.cells[2] : null;
        const contractVal = row.cells.length > 3 ? row.cells[3] : null;
        return {
            date: dateVal instanceof Date ? dateVal.getTime() : FALLBACK_SORT_DATE,
            dealer: pyTruthy(dealerVal) ? pyStr(dealerVal) : '',
            contract: pyTruthy(contractVal) ? pyStr(contractVal) : '',
            row
        };
    });

    // Array.prototype.sort is stable, like list.sort()
    sortable.sort((a, b) =>
        (a.date - b.date) ||
        pyCompareStr(a.dealer, b.dealer) ||
        pyCompareStr(a.contract, b.contract)
    );
    const rowsSorted = sortable.map(item => item.row);

    // monthly_totals = {month: 0.0 for month in months_to_process}
    const monthlyTotals = new Map<number, number>();
    monthsToProcess.forEach(month => monthlyTotals.set(month, 0.0));

    for (const row of rowsSorted) {
        const dateVal = row.cells[0];
        const commVal = row.cells[commissionCol - 1];

        if (dateVal instanceof Date && pyTruthy(commVal)) {
            const month = dateVal.getUTCMonth() + 1;
            if (monthlyTotals.has(month)) {
                try {
                    monthlyTotals.set(month, (monthlyTotals.get(month) as number) + commissionToNumber(commVal));
                } catch {
                    // except: pass
                }
            }
        }
    }

    const grandTotal = pySum(monthlyTotals.values());

    let directSum = 0.0;
    for (const row of rowsSorted) {
        const commVal = row.cells[commissionCol - 1];
        if (pyTruthy(commVal)) {
            try {
                directSum += commissionToNumber(commVal);
            } catch {
                // except: pass
            }
        }
    }

    const monthlySum = pySum(monthlyTotals.values());

    if (Math.abs(directSum - monthlySum) > 0.01 || Math.abs(directSum - grandTotal) > 0.01) {
        // The legacy app prints this and returns None (no PDF).
        throw new Error("✗ VERIFICATION FAILED - Totals don't match!");
    }

    const companyName = extractCompanyName(filePath);

    let html = `<!DOCTYPE html>
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
<h2>${companyName} A/R to ${pyStrftimeMDY(givenDate)}</h2>
<table>
<tr><th>Date</th><th>Agent</th><th>Dealer</th><th>Contract</th><th>Commission</th></tr>
`;

    const textCell = (cells: PyValue[], index: number): string =>
        cells.length > index && pyTruthy(cells[index]) ? pyStr(cells[index]) : '';

    const monthsAdded = new Set<number>();

    rowsSorted.forEach((row, idx) => {
        const cells = row.cells;

        const dateVal = cells[0];
        const dateStr = dateVal instanceof Date
            ? pyStrftimeMDY(dateVal)
            : (pyTruthy(dateVal) ? pyStr(dateVal) : '');

        const agentStr = textCell(cells, 1);
        const dealerStr = textCell(cells, 2);
        const contractStr = textCell(cells, 3);

        const commVal = cells[commissionCol - 1];
        const commStr = pyIsNumber(commVal)
            ? pyFormatMoney(Number(commVal))
            : (pyTruthy(commVal) ? pyStr(commVal) : '');

        html += `<tr><td>${dateStr}</td><td>${agentStr}</td><td>${dealerStr}</td><td>${contractStr}</td><td class="number">${commStr}</td></tr>\n`;

        const currentMonth = dateVal instanceof Date ? dateVal.getUTCMonth() + 1 : null;
        let nextMonth: number | null = null;
        if (idx + 1 < rowsSorted.length) {
            const nextDate = rowsSorted[idx + 1].cells[0];
            nextMonth = nextDate instanceof Date ? nextDate.getUTCMonth() + 1 : null;
        }

        if (currentMonth && (nextMonth === null || nextMonth !== currentMonth)) {
            if (!monthsAdded.has(currentMonth) && monthlyTotals.has(currentMonth)) {
                const monthTotal = monthlyTotals.get(currentMonth) as number;
                html += `<tr class="total-row"><td>${MONTH_NAMES[currentMonth]}</td><td></td><td></td><td></td><td class="number">${pyFormatMoney(monthTotal)}</td></tr>\n`;
                monthsAdded.add(currentMonth);
            }
        }
    });

    html += `<tr class="grand-total"><td>GRAND TOTAL</td><td></td><td></td><td></td><td class="number">${pyFormatMoney(grandTotal)}</td></tr>\n`;
    html += '</table></body></html>';

    return {
        company: companyName,
        rows: rowsSorted.length,
        grandTotal,
        totalCommission: directSum,
        monthlyTotals: Object.fromEntries(monthlyTotals),
        html
    };
}
