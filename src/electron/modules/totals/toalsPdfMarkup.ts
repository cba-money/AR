
import { formatDateRange } from "./util.js";

export function generateHeader(arDate: Date, dateRange: string[]){
    const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'EST'
    };
    const formattedArDate = new Intl.DateTimeFormat('en-US', options).format(arDate);
    const formattedTodayDate = new Intl.DateTimeFormat('en-US', options).format(new Date());

    // Output: "July 12, 2024"
    const formattedDateRange = formatDateRange(dateRange);

    return `<div class="header-banner">
        <div class="header-table">
            <div class="header-row">
                <div class="header-cell-main">
                    <h1>A/R Administrators Totals Sheet</h1>
                    <div class="subtitle">Accounts Receivable (A/R) Performance & Rolling Overview</div>
                </div>
                <div class="header-cell-meta">
                    <strong>A/R To:</strong> ${formattedArDate}<br>
                    <strong>Date Generated:</strong> ${formattedTodayDate}<br>
                    <strong>Period:</strong> ${formattedDateRange ?? `May 2026 – July 2026`}
                </div>
            </div>
        </div>
    </div>`;

}

export function generateSummary(summaryData: {
    title: string;
    value: string;
}[]){
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    let markup = "";
    for(let i = 0; i < summaryData.length; i++){
        let hl = ``;
        if(i === 0) hl = " highlight";
        markup += `<div class="metric-card"><div class="metric-label">${summaryData[i].title}</div>
            <div class="metric-value${hl}">${summaryData[i].value}</div>
        </div>`;
    }
    return `<div class="metrics-summary">${markup}</div>`;
}

export function generateTable(totalsByAdmin: AdminTotal[], monthRange: string[]) {
    const monthNames: Record<number, string> = {
        1: 'JANUARY', 2: 'FEBRUARY', 3: 'MARCH', 4: 'APRIL',
        5: 'MAY', 6: 'JUNE', 7: 'JULY', 8: 'AUGUST',
        9: 'SEPTEMBER', 10: 'OCTOBER', 11: 'NOVEMBER', 12: 'DECEMBER'
    };
    
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    let combinedPortfolioTotals: Record<string, number> = {};
    let grandTotalAr = 0;
    let bodyMarkup = "";

    // Initialize tracking keys for all targeted months
    monthRange.forEach(m => { combinedPortfolioTotals[m] = 0; });

    // 1. Build Data Rows Safely based on monthRange sequence
    for (let i = 0; i < totalsByAdmin.length; i++) {
        let rowCellsMarkup = `<td><span class="admin-name">${totalsByAdmin[i].admin}</span></td>`;
        
        for (let j = 0; j < monthRange.length; j++) {
            const currentMonthKey = monthRange[j]; // Format: "04/2026"
            const numericMonth = Number(currentMonthKey.split("/")[0]);
            
            // Safe fallback value if an administrator doesn't have a record for that specific month
            const monthValue = totalsByAdmin[i].arPerMonth[numericMonth] ?? 0;

            rowCellsMarkup += `<td class="text-right"><span class="currency-symbol">$</span>${currencyFormatter.format(monthValue).replace("$", "")}</td>`;
            
            combinedPortfolioTotals[currentMonthKey] += monthValue;
            grandTotalAr += monthValue;
        }

        rowCellsMarkup += `<td class="text-right font-semibold" style="background-color: #f1f5f9;"><span class="currency-symbol">$</span>${currencyFormatter.format(totalsByAdmin[i].grandTotal).replace("$", "")}</td>`;
        bodyMarkup += `<tr>${rowCellsMarkup}</tr>`;
    }

    // 2. Build Bottom Cumulative Portfolio Row Matrix
    let combinedPortfolioMarkup = `<td>Combined Portfolio Totals</td>`;
    for (let k = 0; k < monthRange.length; k++) {
        const totalVal = combinedPortfolioTotals[monthRange[k]];
        combinedPortfolioMarkup += `<td class="text-right"><span class="currency-symbol">$</span>${currencyFormatter.format(totalVal).replace("$", "")}</td>`;
    }
    combinedPortfolioMarkup += `<td class="text-right"><span class="currency-symbol">$</span>${currencyFormatter.format(grandTotalAr).replace("$", "")}</td>`;

    // 3. Build Column Headers Structure
    let headerMarkup = `<th style="width: 28%;">Administrator Name</th>`;
    for (let l = 0; l < monthRange.length; l++) {
        const splitDate = monthRange[l].split("/");
        const month = monthNames[Number(splitDate[0])];
        const year = splitDate[1] ?? "";
        headerMarkup += `<th style="width: 18%;" class="text-right">${month} ${year} Totals</th>`;
    }
    headerMarkup += `<th style="width: 20%;" class="text-right">Grand Total A/R</th>`;

    return `<table class="data-table">
        <thead>
            <tr>
                ${headerMarkup}
            </tr>
        </thead>
        <tbody>
            ${bodyMarkup}
            <tr class="row-total">
                ${combinedPortfolioMarkup}
            </tr>
        </tbody>
    </table>`;
}


export function generateDisclaimer(){
    return `<div class="callout-box">
        <strong>Data Compliance Notes:</strong> The individual figures listed above reflect active ledger accounts assigned directly to each corporate administrator. Grand totals encompass all outstanding Accounts Receivable entries across the three designated billing months, excluding written-off or collection-forwarded portfolios.
    </div>`;
}

export function generateStyles(){ 
    return `<style>
        /* Base Setup & CSS Reset */
        *, *::before, *::after {
            box-sizing: border-box;
        }
        
        @page {
            size: A4;
            margin: 20mm 15mm;
            background-color: #ffffff;
            @bottom-right {
                content: "Page " counter(page) " of " counter(pages);
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-size: 8pt;
                color: #94a3b8;
            }
            @bottom-left {
                content: "Internal Financial Report - Confidential";
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-size: 8pt;
                color: #94a3b8;
            }
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #334155;
            font-size: 10pt;
            line-height: 1.5;
        }

        header{
            padding: 0px 5px;
        }

        /* Full bleed top banner designed for PDF page margins */
        
       .header-banner {
            margin: -20mm -15mm 30px -15mm; /* Increased bottom spacing gap */
            padding: 25px 15mm;
            background-color: #1b365d;
            color: #ffffff;
            display: block;
            clear: both; /* Clear out any unintended element floating */
        }

        .header-row {
            display: table-row;
        }

        .header-banner {
            /* Pull the background box into the margin area */
            margin: -20mm -15mm 25px -15mm; 
            
            /* FIX: Top padding must be at least 20mm to push the text down 
            out of the dead zone and into the printable area of the page */
            padding: 22mm 15mm 15mm 15mm; 
            
            background-color: #1b365d;
            color: #ffffff;
        }

        .header-table {
            display: table;
            width: 100%;
            table-layout: fixed; /* Keeps columns perfectly aligned */
        }

        .header-cell-main {
            display: table-cell;
            vertical-align: bottom; /* Aligns text cleanly with the metadata cell */
            width: 60%;
        }

        .header-cell-meta {
            display: table-cell;
            vertical-align: bottom; /* Aligns metadata cleanly with the title text */
            text-align: right;
            font-size: 9pt;
            color: #93c5fd;
            line-height: 1.5;
            width: 40%;
        }

        h1 {
            margin: 0 0 5px 0;
            font-size: 20pt;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #ffffff;
        }

        .subtitle {
            margin: 0;
            font-size: 11pt;
            color: #93c5fd;
            font-weight: 300;
        }

        /* Metric Cards Panel (Using safe table cells instead of flex/grid for PDF compatibility) */
        .metrics-summary {
            display: table;
            width: 100%;
            table-layout: fixed;
            margin-bottom: 30px;
            border-spacing: 12px 0;
            margin-left: -12px;
            margin-right: -12px;
        }

        .metric-card {
            display: table-cell;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 14px 16px;
            vertical-align: top;
        }

        .metric-label {
            font-size: 8.5pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 6px;
            font-weight: 600;
        }

        .metric-value {
            font-size: 16pt;
            font-weight: 700;
            color: #1b365d;
            margin: 0;
        }
        
        .metric-value.highlight {
            color: #0f766e;
        }

        /* Section Header */
        h2 {
            font-size: 13pt;
            color: #1b365d;
            margin: 20px 0 12px 0;
            padding-bottom: 6px;
            border-bottom: 2px solid #e2e8f0;
            page-break-after: avoid;
        }

        /* Main Performance Matrix Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .data-table th {
            background-color: #2c4a75;
            color: #ffffff;
            font-weight: 600;
            text-align: left;
            padding: 10px 12px;
            font-size: 9.5pt;
            border: 1px solid #2c4a75;
        }

        .data-table td {
            padding: 11px 12px;
            border-bottom: 1px solid #e2e8f0;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            vertical-align: middle;
        }

        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        
        /* Utility styles */
        .text-right {
            text-align: right;
        }
        
        .font-semibold {
            font-weight: 600;
        }

        /* Cumulative Row */
        .row-total {
            background-color: #f1f5f9 !important;
            font-weight: bold;
            color: #1b365d;
            border-top: 2px solid #1b365d;
        }
        
        .row-total td {
            border-bottom: 2px solid #1b365d;
        }

        .admin-name {
            color: #1b365d;
            font-weight: 600;
        }

        .currency-symbol {
            color: #94a3b8;
            font-weight: normal;
            float: left;
        }

        /* Callout layout block */
        .callout-box {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 12px 15px;
            border-radius: 0 6px 6px 0;
            margin-top: 25px;
            font-size: 9pt;
            color: #1e3a8a;
        }
    </style>`;
}

