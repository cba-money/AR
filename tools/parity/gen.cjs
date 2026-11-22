// Generates synthetic "Weekly 7" workbooks that exercise every code path where the
// legacy pipeline (ar-formatter + ar-app) and the A/R Desktop Suite could diverge.
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "inputs");
fs.mkdirSync(OUT, { recursive: true });

const YELLOW = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };
const GREEN = { type: "pattern", pattern: "solid", fgColor: { argb: "FF92D050" } };
const d = (y, m, day, h = 0, min = 0) => new Date(Date.UTC(y, m - 1, day, h, min));

const HEADERS = [
  "Date", "Agent", "Dealer", "Contract #", "Customer", "Vehicle", "Price", "Cost",
  "Commission", "Date Paid", "Check #", "Notes", "Week Adjusted",
];

function addSheet(wb, name, headers = HEADERS) {
  const ws = wb.addWorksheet(name);
  const hr = ws.getRow(1);
  headers.forEach((h, i) => {
    const c = hr.getCell(i + 1);
    c.value = h;
    c.font = { bold: true };
  });
  hr.commit?.();
  return ws;
}

// row spec: {date, agent, dealer, contract, comm, paid, adj, fill, fillCols, commCol}
function addRow(ws, r, commCol = 9) {
  const row = ws.getRow(ws.rowCount + 1);
  const width = Math.max(13, commCol + 4);
  const set = (col, v, fmt) => {
    const c = row.getCell(col);
    c.value = v === undefined ? null : v;
    if (fmt) c.numFmt = fmt;
  };
  set(1, r.date, "mm/dd/yyyy");
  set(2, r.agent ?? "J. Smith");
  set(3, r.dealer ?? "Main St Motors");
  set(4, r.contract);
  set(5, "Customer " + (typeof r.contract === "string" ? r.contract : "X"));
  set(commCol, r.comm === undefined ? 100 : r.comm, typeof r.comm === "string" ? undefined : "#,##0.00");
  if (r.paid !== undefined) set(commCol + 1, r.paid, r.paid instanceof Date ? "mm/dd/yyyy" : undefined);
  if (r.adj !== undefined) set(commCol + 4, r.adj);
  if (r.extra) for (const [col, v] of Object.entries(r.extra)) set(Number(col), v);
  const fill = r.fill === undefined ? YELLOW : r.fill;
  const fillCols = r.fillCols ?? Array.from({ length: width }, (_, i) => i + 1);
  if (fill) for (const col of fillCols) row.getCell(col).fill = fill;
  return row;
}

async function save(wb, admin) {
  const p = path.join(OUT, `${admin} - Weekly 7.xlsx`);
  await wb.xlsx.writeFile(p);
  return p;
}

(async () => {
  // ------------------------------------------------------------------ 01 clean baseline
  {
    const wb = new ExcelJS.Workbook();
    const ws25 = addSheet(wb, "2025");
    addRow(ws25, { date: d(2025, 12, 19), contract: "OLD-1", comm: 50 });
    const ws = addSheet(wb, "2026");
    addRow(ws, { date: d(2026, 3, 27), contract: "MAR-OUT", comm: 75 });          // out of range
    addRow(ws, { date: d(2026, 4, 10), contract: "C-1001", comm: 150.5 });         // unpaid -> keep
    addRow(ws, { date: d(2026, 4, 17), contract: "C-1002", comm: 200, paid: d(2026, 5, 15) }); // paid before -> drop
    addRow(ws, { date: d(2026, 5, 8), contract: "C-1003", comm: 310.25, paid: d(2026, 7, 31) }); // paid on AR date -> drop
    addRow(ws, { date: d(2026, 5, 15), contract: "C-1004", comm: 99.99, paid: d(2026, 8, 7) }); // paid after -> keep
    addRow(ws, { date: d(2026, 5, 22), contract: "C-1005", comm: 400, paid: "VOID" });
    addRow(ws, { date: d(2026, 6, 5), contract: "C-1006", comm: 125, paid: "Rejected" });
    addRow(ws, { date: d(2026, 6, 12), contract: "C-1007", comm: 80, adj: "DEDUCTED 6/26/26" }); // past -> drop
    addRow(ws, { date: d(2026, 6, 19), contract: "C-1008", comm: 60, adj: "DEDUCTED 8/14/26" }); // future -> keep
    addRow(ws, { date: d(2026, 6, 26), contract: "C-1009", comm: 45, paid: d(2026, 7, 3), adj: "DEDUCTED 08/14/2026 - recheck" }); // future protects
    addRow(ws, { date: d(2026, 7, 10), contract: "C-1010", comm: 1234.56 });
    addRow(ws, { date: d(2026, 7, 17), contract: "C-1011", comm: 500, fill: null });  // not highlighted
    addRow(ws, { date: d(2026, 7, 24), contract: "C-1012", comm: 20, fill: GREEN });  // other colour
    addRow(ws, { date: d(2026, 7, 24), contract: "C-1013", comm: { formula: "G15*0.1", result: 77.7 } }); // formula flattened
    addRow(ws, { date: d(2026, 7, 31), contract: "C-1014", comm: 10 });
    await save(wb, "ALPHA");
  }

  // ------------------------------------------------------------------ 02 contract dated 1st of the first month in range
  {
    const wb = new ExcelJS.Workbook();
    const ws = addSheet(wb, "2026");
    addRow(ws, { date: d(2026, 4, 1), contract: "FIRST-APR", comm: 1000 });
    addRow(ws, { date: d(2026, 4, 2), contract: "C-2002", comm: 100 });
    addRow(ws, { date: d(2026, 5, 1), contract: "FIRST-MAY", comm: 250 });
    addRow(ws, { date: d(2026, 7, 31), contract: "C-2004", comm: 100 });
    await save(wb, "BRAVO");
  }

  // ------------------------------------------------------------------ 03 contract dated 1st of the month AFTER the range
  {
    const wb = new ExcelJS.Workbook();
    const ws = addSheet(wb, "2026");
    addRow(ws, { date: d(2026, 4, 10), contract: "C-3001", comm: 100 });
    addRow(ws, { date: d(2026, 8, 1), contract: "FIRST-AUG", comm: 300 });
    await save(wb, "CHARLIE");
  }

  // ------------------------------------------------------------------ 04 DEDUCTED variants that do not abort the legacy run
  {
    const wb = new ExcelJS.Workbook();
    const ws = addSheet(wb, "2026");
    addRow(ws, { date: d(2026, 4, 10), contract: "D-LOWER", comm: 100, adj: "Deducted 5/1/26" }); // legacy is case-sensitive
    addRow(ws, { date: d(2026, 4, 17), contract: "D-RICH-PAST", comm: 110,
      adj: { richText: [{ font: { bold: true, color: { argb: "FFFF0000" } }, text: "DEDUCTED " }, { text: "5/8/26" }] } });
    addRow(ws, { date: d(2026, 4, 24), contract: "D-RICH-FUTURE-PAID", comm: 120, paid: d(2026, 5, 1),
      adj: { richText: [{ font: { bold: true }, text: "DEDUCTED " }, { text: "9/4/26" }] } });
    addRow(ws, { date: d(2026, 5, 8), contract: "D-TWO", comm: 130, adj: "DEDUCTED 5/15/26 DEDUCTED 9/11/26" }); // legacy reads the LAST one
    addRow(ws, { date: d(2026, 5, 15), contract: "D-FUTURE-VOID", comm: 140, paid: "VOID", adj: "DEDUCTED 9/18/26" });
    addRow(ws, { date: d(2026, 5, 22), contract: "D-ON-DATE", comm: 150, adj: "DEDUCTED 07/31/2026" });
    await save(wb, "DELTA");
  }

  // ------------------------------------------------------------------ 05 DEDUCTED text the legacy parser cannot read
  {
    const wb = new ExcelJS.Workbook();
    const ws = addSheet(wb, "2026");
    addRow(ws, { date: d(2026, 4, 10), contract: "E-1", comm: 100 });
    addRow(ws, { date: d(2026, 4, 17), contract: "E-2", comm: 200, adj: "DEDUCTED 5/1/26 PAID BACK 6/5/26" });
    await save(wb, "ECHO");
  }

  // ------------------------------------------------------------------ 06 commission cell variants
  {
    const wb = new ExcelJS.Workbook();
    const ws = addSheet(wb, "2026");
    addRow(ws, { date: d(2026, 4, 10), contract: "F-BLANK", comm: null });
    addRow(ws, { date: d(2026, 4, 17), contract: "F-TEXT", comm: "N/A" });
    addRow(ws, { date: d(2026, 4, 24), contract: "F-DOLLAR-TEXT", comm: "$1,200.00" });
    addRow(ws, { date: d(2026, 5, 8), contract: "F-TIE-125", comm: 12.125 });
    addRow(ws, { date: d(2026, 5, 15), contract: "F-TIE-625", comm: 100.625 });
    addRow(ws, { date: d(2026, 5, 22), contract: "F-ZERO", comm: 0 });
    addRow(ws, { date: d(2026, 6, 5), contract: "F-NEG", comm: -45.5 });
    addRow(ws, { date: d(2026, 6, 12), contract: "F-TRAILING", comm: "250 CR" });
    await save(wb, "FOXTROT");
  }

  // ------------------------------------------------------------------ 07 sort order (same date, mixed case / punctuation)
  {
    const wb = new ExcelJS.Workbook();
    const ws = addSheet(wb, "2026");
    const dt = d(2026, 6, 12);
    addRow(ws, { date: dt, dealer: "abc Motors", contract: "a100", comm: 1 });
    addRow(ws, { date: dt, dealer: "ABC Motors", contract: "A-100", comm: 2 });
    addRow(ws, { date: dt, dealer: "Abbott Auto", contract: "A100", comm: 3 });
    addRow(ws, { date: dt, dealer: "Zed Cars", contract: "B 20", comm: 4 });
    addRow(ws, { date: dt, dealer: "ABC Motors", contract: "a-100", comm: 5 });
    addRow(ws, { date: dt, dealer: "de Luca Autos", contract: 20045, comm: 6 });
    addRow(ws, { date: dt, dealer: "ABC Motors", contract: "A_100", comm: 7 });
    await save(wb, "GOLF");
  }

  // ------------------------------------------------------------------ 08 header is not literally "Commission"
  {
    const wb = new ExcelJS.Workbook();
    const h = HEADERS.slice(); h[8] = "Commission Due";
    const ws = addSheet(wb, "2026", h);
    addRow(ws, { date: d(2026, 4, 10), contract: "H-1", comm: 100 });
    addRow(ws, { date: d(2026, 6, 10), contract: "H-2", comm: 200 });
    await save(wb, "HOTEL");
  }

  // ------------------------------------------------------------------ 09 rich text / hyperlink / odd cell types in display columns
  {
    const wb = new ExcelJS.Workbook();
    const ws = addSheet(wb, "2026");
    addRow(ws, { date: d(2026, 4, 10), contract: "I-RICH", comm: 100,
      dealer: { richText: [{ font: { bold: true }, text: "Rich " }, { text: "Dealer LLC" }] } });
    addRow(ws, { date: d(2026, 4, 17), contract: "I-LINK", comm: 200,
      dealer: { text: "Linked Dealer", hyperlink: "https://example.com/dealer" } });
    addRow(ws, { date: d(2026, 4, 24), contract: 1002003004005, comm: 300 });
    addRow(ws, { date: d(2026, 5, 8), contract: "I-VOID-RICH", comm: 400,
      paid: { richText: [{ font: { color: { argb: "FFFF0000" } }, text: "VOID" }] } });
    addRow(ws, { date: d(2026, 5, 15), contract: "I-PAID-TIME", comm: 500, paid: d(2026, 7, 31, 3, 0) });
    await save(wb, "INDIA");
  }

  // ------------------------------------------------------------------ 10 second header containing "commission" appears first
  {
    const wb = new ExcelJS.Workbook();
    const h = HEADERS.slice(); h[6] = "Commission %";
    const ws = addSheet(wb, "2026", h);
    addRow(ws, { date: d(2026, 4, 10), contract: "J-1", comm: 100, extra: { 7: 0.1 } });
    addRow(ws, { date: d(2026, 6, 10), contract: "J-2", comm: 200, extra: { 7: 0.1 } });
    await save(wb, "JULIET");
  }

  // ------------------------------------------------------------------ 11 year-crossing range (used with A/R date 01/31/2027)
  {
    const wb = new ExcelJS.Workbook();
    const ws26 = addSheet(wb, "2026");
    addRow(ws26, { date: d(2026, 10, 9), contract: "K-OCT", comm: 1000.1 });
    addRow(ws26, { date: d(2026, 11, 13), contract: "K-NOV", comm: 2000.2 });
    addRow(ws26, { date: d(2026, 12, 11), contract: "K-DEC", comm: 3000.3 });
    const ws27 = addSheet(wb, "2027");
    addRow(ws27, { date: d(2027, 1, 8), contract: "K-JAN", comm: 4000.4 });
    addRow(ws27, { date: d(2027, 1, 15), contract: "K-JAN2", comm: 5000.5 });
    await save(wb, "KILO");
  }

  console.log(fs.readdirSync(OUT).join("\n"));
})();
