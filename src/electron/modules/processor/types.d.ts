interface ProcessResult {
    company: string;
    rows: number;
    grandTotal: number;
    totalCommission: number;
    monthlyTotals: Record<number, number>;
    pdfSize: number;
    fileName: string;
}
