import path from 'path';

import {
    generateHeader,
    generateSummary,
    generateTable,
    generateDisclaimer,
    generateStyles,
} from './toalsPdfMarkup.js';

import { generatePdfLocally } from '../processor/generatePdf.js';

export async function generateTotals(totals: {
    grandTotal: number;
    totalCommission: number;
    totalsByAdmin: Total[];
}, arDate: Date, dateRange: string[], exportPath: string, runId: string){
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    let html: string = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>A/R Totals Sheet</title>
    ${generateStyles()}
</head>
<body>
    <header>
        ${generateHeader(arDate, dateRange)}
    </header>

    ${generateSummary([
        { 
            title: 'Total Outstanding A/R',
            value: `${currencyFormatter.format(totals.grandTotal)}`
        },
        { 
            title: 'Active Administrators',
            value: `${totals.totalsByAdmin.length} Selected`
        },
        { 
            title: 'Total Commissions',
            value: `${currencyFormatter.format(totals.totalCommission)}`
        }
    ])}    

    <h2>Individual Administrative Aggregates</h2>
    
    ${generateTable(totals.totalsByAdmin, dateRange)}

    ${generateDisclaimer()}

</body>
</html>`

    let pdfFilePath = path.join(exportPath, `ar-totals-${runId}.pdf`)

    try{
        await generatePdfLocally(html, pdfFilePath);
        return pdfFilePath;
    } catch (error){
        return;
    }

}