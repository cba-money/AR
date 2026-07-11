interface ProcessResult {
    company: string;
    rows: number;
    grandTotal: number;
    monthlyTotals: Record<number, number>;
    pdfSize: number;
    fileName: string;
}

interface CellData {
    value: any;
    format: string | null;
}

interface RowData {
    rowNum: number;
    cells: CellData[];
    dateFormat?: string | null;
}

interface SortableRow {
    idx: number;
    date: Date;
    dealer: string;
    contract: string;
    rowData: RowData;
}