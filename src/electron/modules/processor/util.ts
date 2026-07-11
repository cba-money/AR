import ExcelJS from 'exceljs';
import * as path from 'path';

// --- Helper Functions ---


export function getAdminName(inputFile: string): string {
    const fileName = path.basename(inputFile);
    const parts = fileName.split(" ");

    if (parts.length >= 1) {
        return parts[0];
    }
    return "UNKNOWN";
}

/**
 * Parses a date string formatted as MM/DD/YY or MM/DD/YYYY in UTC
 */
export function parseDateString(dateStr: string): Date | null {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    
    const utcTime = Date.UTC(year, month, day);
    
    return isNaN(utcTime) ? null : new Date(utcTime);
}

/**
 * Extracts numeric value from currency strings or ExcelJS formula objects
 */
export function parseCurrency(val: any): number {
    if (val && typeof val === 'object' && 'result' in val) {
        val = val.result;
    }

    if (typeof val === 'number') return val;
    if (!val) return 0;
    
    const cleanStr = String(val).replace(/[$,]/g, '').trim();
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Finds the commission column by searching row 2
 */
export function findCommissionColumn(ws: ExcelJS.Worksheet): number | null {
    const row = ws.getRow(2);
    for (let col = 1; col <= row.cellCount; col++) {
        const text = String(row.getCell(col).value ?? "")
            .trim()
            .toLowerCase();

        if (text === "commission") {
            return col;
        }
    }
    return null;
}

/**
 * Identifies the exact yellow color code from column C
 */
export function getYellowColorCode(worksheet: ExcelJS.Worksheet): string {
    const yellowCodes: Record<string, number> = {};
    const maxRow = Math.min(20, worksheet.rowCount);
    
    for (let rowNum = 3; rowNum <= maxRow; rowNum++) {
        const cell = worksheet.getCell(rowNum, 3);
        const fill = cell.fill as ExcelJS.FillPattern;
        
        if (fill && fill.type === 'pattern' && fill.fgColor?.argb) {
            const color = fill.fgColor.argb;
            if (color.toUpperCase().includes('FFFF')) {
                yellowCodes[color] = (yellowCodes[color] || 0) + 1;
            }
        }
    }
    
    if (Object.keys(yellowCodes).length > 0) {
        return Object.keys(yellowCodes).reduce((a, b) => yellowCodes[a] > yellowCodes[b] ? a : b);
    }
    return 'FFFFFF00';
}