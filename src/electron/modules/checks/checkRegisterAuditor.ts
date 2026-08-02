import ExcelJS from 'exceljs';
import { EventEmitter } from 'events';

export interface Discrepancy {
  row: number;
  checkNumber: string;
  issue: string;
}

export interface AuditResult {
  discrepancies: Discrepancy[];
  modifiedRunBuffer: Uint8Array;
  modifiedRegisterBuffer: Uint8Array;
  discrepanciesBuffer: Uint8Array;
}

export class CheckRegisterAuditor extends EventEmitter {
  
  constructor() {
    super();
  }

  /**
   * Processes the check register and check run Excel files.
   * @param registerBuffer ArrayBuffer of the Register Excel file
   * @param runBuffer ArrayBuffer of the Run Excel file
   */
  public async process(registerBuffer: ArrayBuffer, runBuffer: ArrayBuffer): Promise<AuditResult> {
    try {
      this.emit('progress', 'Initializing workbooks...');
      
      const registerWb = new ExcelJS.Workbook();
      const runWb = new ExcelJS.Workbook();

      // FIX 1: Wrap the raw ArrayBuffers in Uint8Arrays. 
      // This forces the ExcelJS browser build to read the binary data correctly.
        // Wrap the raw ArrayBuffers in Uint8Arrays for the browser build
      const regData = new Uint8Array(registerBuffer);
      const runData = new Uint8Array(runBuffer);

      // Cast to unknown as Buffer to satisfy TypeScript's Node requirements
      await registerWb.xlsx.load(regData as any);
      await runWb.xlsx.load(runData as any);

      // FIX 2: Use getWorksheet(1) which is the official, safer way to grab the first sheet.
      const registerWs = registerWb.getWorksheet(1) || registerWb.worksheets[0];
      const runWs = runWb.getWorksheet(1) || runWb.worksheets[0];

      if (!registerWs || !runWs) {
        // Provide a much more specific error message to help with debugging
        throw new Error(
          `Failed to read worksheets. Register sheets found: ${registerWb.worksheets.length}, Run sheets found: ${runWb.worksheets.length}. ` +
          `Make sure both files are true .xlsx formats (not .xls or .csv).`
        );
      }

      this.emit('progress', 'Detecting headers...');


      const runHeaderRow = this.detectHeaderRow(runWs);
      if (runHeaderRow === 2) runWs.spliceRows(1, 1);

      const registerCheckCol = this.findColumnByHeader(registerWs, ['Check #', 'Check Number']);
      let registerDateCashedCol = this.findColumnByHeader(registerWs, ['Date Cashed?', 'Date Cashed']);
      const registerAmountCol = this.findColumnByHeader(registerWs, ['Amount', 'Check Amount']);

      if (registerDateCashedCol === -1) {
        registerDateCashedCol = registerWs.columnCount + 1;
        registerWs.getRow(1).getCell(registerDateCashedCol).value = 'Date Cashed?';
      }

      const runCheckCol = this.findColumnByHeader(runWs, ['Check #', 'Check Number', 'Cust. Ref. / Check Number']);
      const runAmountCol = this.findColumnByHeader(runWs, ['Debit', 'Amount']);
      const runDateCol = this.findColumnByHeader(runWs, ['Date', 'Check Date', 'Date Cashed']);

      if ([registerCheckCol, registerDateCashedCol, registerAmountCol, runCheckCol, runAmountCol].includes(-1)) {
        throw new Error('One or more required headers were not found in the provided files.');
      }

      const discrepancies: Discrepancy[] = [];
      const voidedChecks: string[] = [];
      const voidedBases = new Set<string>();

      const normalFont: Partial<ExcelJS.Font> = { bold: false, color: { argb: 'FF000000' } };
      const yellowFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
      const blueFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } };

      this.emit('progress', 'Processing voided checks...');

      for (let rr = 2; rr <= registerWs.rowCount; rr++) {
        const regRow = registerWs.getRow(rr);
        const regCheck = this.normalizeValue(regRow.getCell(registerCheckCol).value);

        if (regCheck && regCheck.endsWith('V')) {
          const baseCheck = regCheck.slice(0, -1);
          voidedChecks.push(regCheck);
          voidedBases.add(baseCheck);

          const duplicateRow = this.getRegisterRowByCheck(registerWs, registerCheckCol, baseCheck);
          if (!duplicateRow) continue;

          const dateCell = duplicateRow.getCell(registerDateCashedCol);
          dateCell.value = 'VOID';
          dateCell.alignment = { horizontal: 'right' };
          dateCell.font = { bold: true, color: { argb: 'FFFF0000' } };
        }
      }

      this.emit('progress', 'Auditing check run against register...');

      for (let r = 2; r <= runWs.rowCount; r++) {
        const runRow = runWs.getRow(r);
        let hasDiscrepancy = false;
        
        const checkNumber = this.normalizeValue(runRow.getCell(runCheckCol).value);
        const rawRunAmount = this.normalizeValue(runRow.getCell(runAmountCol).value).replace(/[^0-9.-]/g, '');
        const runAmount = Number(rawRunAmount);

        if (!checkNumber) continue;

        if (voidedBases.has(checkNumber)) {
          this.styleRow(runRow, blueFill);
          hasDiscrepancy = true;
          this.recordDiscrepancy(discrepancies, { checkNumber, issue: 'Voided check appears in check run', row: r });
          continue;
        }

        const matches: ExcelJS.Row[] = [];
        for (let rr = 2; rr <= registerWs.rowCount; rr++) {
          const regRow = registerWs.getRow(rr);
          const regCheck = this.normalizeValue(regRow.getCell(registerCheckCol).value);
          if (regCheck === checkNumber) matches.push(regRow);
        }

        if (matches.length > 1) {
          throw new Error(`Check number ${checkNumber} appears more than once in the register.`);
        }

        if (matches.length === 0) {
          this.styleRow(runRow, blueFill);
          hasDiscrepancy = true;
          this.recordDiscrepancy(discrepancies, { checkNumber, issue: 'Not found in register', row: r });
          continue;
        }

        const regRow = matches[0];
        const dateCashed = this.getDisplayDate(regRow.getCell(registerDateCashedCol).value);
        
        const rawRegAmount = this.normalizeValue(regRow.getCell(registerAmountCol).value).replace(/[^0-9.-]/g, '');
        const regAmount = Number(rawRegAmount);

        if (dateCashed === 'VOID') {
          this.styleRow(runRow, blueFill);
          hasDiscrepancy = true;
          this.recordDiscrepancy(discrepancies, { checkNumber, issue: 'Voided check appears in check run', row: r });
          continue;
        }

        if (!dateCashed && runAmount === regAmount) {
          const dateCell = regRow.getCell(registerDateCashedCol);
          const runDate = runRow.getCell(runDateCol).value;
          dateCell.value = runDate;
          dateCell.alignment = { horizontal: 'right' };
          dateCell.font = normalFont;
        }

        if (dateCashed && dateCashed !== 'VOID') {
          hasDiscrepancy = true;
          this.styleRow(runRow, blueFill);
          this.recordDiscrepancy(discrepancies, { checkNumber, issue: `Previously cashed: ${dateCashed}`, row: r });
        }

        if (!Number.isNaN(runAmount) && !Number.isNaN(regAmount) && runAmount !== regAmount) {
          hasDiscrepancy = true;
          this.styleRow(runRow, blueFill);
          this.recordDiscrepancy(discrepancies, { checkNumber, issue: `Amount mismatch. Run: ${runAmount}, Register: ${regAmount}`, row: r });
        }

        if (!hasDiscrepancy) {
          this.styleRow(runRow, yellowFill);
        }
      }

      this.emit('progress', 'Generating output files...');

      // Generate Discrepancies Workbook
      const discWb = new ExcelJS.Workbook();
      const discWs = discWb.addWorksheet('Discrepancies');
      discWs.columns = [
        { header: 'Row', key: 'row', width: 10 },
        { header: 'Check Number', key: 'checkNumber', width: 20 },
        { header: 'Issue', key: 'issue', width: 60 }
      ];
      discWs.addRows(discrepancies);

      // Write to ArrayBuffers
      const modifiedRunBuffer = new Uint8Array(await runWb.xlsx.writeBuffer());
      const modifiedRegisterBuffer = new Uint8Array(await registerWb.xlsx.writeBuffer());
      const discrepanciesBuffer = new Uint8Array(await discWb.xlsx.writeBuffer());

      const result: AuditResult = {
        discrepancies,
        modifiedRunBuffer,
        modifiedRegisterBuffer,
        discrepanciesBuffer
      };

      this.emit('done', result);
      return result;

    } catch (err: any) {
      this.emit('error', err);
      throw err;
    }
  }

  // --- Private Helpers ---

  private recordDiscrepancy(collection: Discrepancy[], discrepancy: Discrepancy) {
    collection.push(discrepancy);
    this.emit('discrepancy', discrepancy);
  }

  private findColumnByHeader(worksheet: ExcelJS.Worksheet, possibleNames: string[]): number {
    const headerRow = worksheet.getRow(1);
    const normalized = possibleNames.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    for (let i = 1; i <= headerRow.cellCount; i++) {
      const cellValue = String(headerRow.getCell(i).value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalized.includes(cellValue)) return i;
    }
    return -1;
  }

  private detectHeaderRow(ws: ExcelJS.Worksheet): number {
    const row1 = (ws.getRow(1).values as any[]).join(' ').toLowerCase();
    const row2 = (ws.getRow(2).values as any[]).join(' ').toLowerCase();
    const hasHeaders = (str: string) => str.includes('check') && (str.includes('debit') || str.includes('amount'));
    return hasHeaders(row1) ? 1 : hasHeaders(row2) ? 2 : 1;
  }

  private normalizeValue(value: any): string {
    if (value == null) return '';
    if (typeof value === 'object' && value.text) return String(value.text).trim();
    if (typeof value === 'object' && value.richText) return value.richText.map((x: any) => x.text).join('').trim();
    return String(value).trim();
  }

  private getDisplayDate(value: any): string {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'object' && value.result instanceof Date) return value.result.toISOString().slice(0, 10);
    return String(value).trim();
  }

  private styleRow(row: ExcelJS.Row, fill: ExcelJS.Fill) {
    if (row.number === 1) return;
    row.eachCell(cell => {
      cell.fill = fill;
    });
  }

  private getRegisterRowByCheck(worksheet: ExcelJS.Worksheet, checkColIndex: number, checkNumber: string): ExcelJS.Row | null {
    for (let rr = 2; rr <= worksheet.rowCount; rr++) {
      const regRow = worksheet.getRow(rr);
      const regCheck = this.normalizeValue(regRow.getCell(checkColIndex).value);
      if (regCheck === checkNumber) return regRow;
    }
    return null;
  }
}