import * as fs from 'fs';
import * as path from 'path';

import { generatePdfLocally } from './generatePdf.js';
import { buildARReport } from './buildReport.js';

// --- Main Processing Function ---

/**
 * Builds the A/R report for one formatted workbook and renders it to PDF.
 *
 * The report itself comes from buildARReport(), the 1:1 port of the legacy Python
 * processor. This wrapper only decides where the PDF goes and renders it.
 *
 * @param givenDate midnight UTC of the A/R date (use parseArDate)
 */
export async function processARFile(
    filePath: string,
    givenDate: Date,
    monthsToProcess: number[]
): Promise<ProcessResult | null> {

    const fileName = path.basename(filePath).replace('.xlsx', '-PROCESSED.pdf').replace('.csv', '-PROCESSED.pdf').replace(/ /g, "-");
    const fileLoc = path.dirname(filePath);
    const outputPdfPath = path.join(
        fileLoc,
        fileName
    );

    const report = await buildARReport(filePath, givenDate, monthsToProcess);

    try {
        await generatePdfLocally(report.html, outputPdfPath);
    } catch (error) {
        throw new Error(`✗ Error generating PDF: ${error}`);
    }

    if (!fs.existsSync(outputPdfPath)) {
        throw new Error('✗ PDF creation failed (File not found after generation)');
    }

    return {
        company: report.company,
        rows: report.rows,
        grandTotal: report.grandTotal,
        totalCommission: report.totalCommission,
        monthlyTotals: report.monthlyTotals,
        pdfSize: fs.statSync(outputPdfPath).size,
        fileName: outputPdfPath
    };
}
