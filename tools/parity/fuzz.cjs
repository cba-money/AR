// Random "Weekly 7" workbooks built from pools of awkward-but-plausible cell contents.
// usage: node fuzz.cjs <outDir> <count> [seed]
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const [outDir, countArg, seedArg] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

let seed = Number(seedArg ?? 20260731) >>> 0;
const rnd = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
// weighted pick: [[weight, value], ...]
const pick = (pool) => { const total = pool.reduce((s, [w]) => s + w, 0); let x = rnd() * total; for (const [w, v] of pool) { if ((x -= w) < 0) return typeof v === "function" ? v() : v; } return pool[0][1]; };
const d = (y, m, day, h = 0, min = 0, s = 0) => new Date(Date.UTC(y, m - 1, day, h, min, s));
const rich = (...parts) => ({ richText: parts.map((text, i) => ({ text, font: i % 2 ? { bold: true } : { color: { argb: "FFFF0000" } } })) });

const solid = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const FILLS = [
  [60, solid("FFFFFF00")], [6, solid("FFFFFF99")], [4, solid("FFFFD966")], [3, solid("FFFFC000")], [3, solid("FFFFF200")],
  [3, solid("FFFFFFCC")], [2, solid("FFFFFFFF")], [3, solid("FF92D050")], [2, { type: "pattern", pattern: "solid", fgColor: { theme: 7 } }],
  [2, { type: "pattern", pattern: "solid", fgColor: { indexed: 13 } }], [2, solid("00FFFF00")], [2, solid("FFFF00")], [6, null],
];
const randomDate = () => pick([
  [70, () => d(2026, int(3, 8), int(1, 28))],
  [10, () => d(2026, int(4, 7), 1)], [0.4, d(2026, 8, 1)],
  [6, () => d(2026, int(3, 7), pick([[1, 30], [1, 31]]))],
  [4, () => d(2026, int(5, 7), 1, int(0, 23), int(0, 59))],
  [4, () => d(2025, int(4, 7), int(1, 28))],
  [3, () => d(2027, int(1, 7), int(2, 28))],
]);
const DATES = [
  [95, randomDate], [0.3, () => `${int(4, 7)}/${int(1, 28)}/2026`], [2, null], [0.3, () => 46100 + int(0, 120)],
  [1, "TOTAL"], [0.3, () => d(1899, 12, 30, int(1, 20), 30)], [0.3, () => rich("5/", "12/2026")], [1, 0], [0.3, true],
];
const NAMES = [
  [10, "Main St Motors"], [6, "main st motors"], [6, "MAIN ST MOTORS"], [6, "Ábaco Autos"], [6, "Zeta Cars"], [6, "abc auto"], [6, "ABC Auto"],
  [5, "A&B <Sales>"], [5, " Leading Space LLC"], [4, "Über Motors"], [4, "éclair"], [4, "Z"], [4, "a"], [4, "_Underscore"], [4, "10 Mile Auto"],
  [4, "9th Street"], [3, 1234], [3, 12.5], [3, null], [3, ""], [3, () => rich("Rich ", "Dealer")], [3, "😀 Auto"], [3, "\uFB01ne Cars"],
  [2, { text: "Linked Dealer", hyperlink: "https://example.com/d" }], [2, true], [2, false], [2, 0], [2, () => d(2026, 5, 5)], [2, "O'Brien \"Quoted\""],
];
const CONTRACTS = [
  [40, () => "C-" + int(1, 99999)], [20, () => int(1, 9999999)], [6, () => "c-" + int(1, 999)], [5, () => int(1, 999) + 0.5], [4, null],
  [4, () => "00" + int(1, 999)], [3, 1e21], [3, 123456789012345680000], [3, 1.5e-7], [3, 0.1 + 0.2], [3, () => rich("RT-", String(int(1, 99)))], [2, -0],
  [2, { error: "#N/A" }], [2, 1e16], [2, 123456789.125],
];
const COMMS = [
  [40, () => int(1, 500000) / 100], [10, () => int(1, 5000)], [8, () => int(0, 4000) + pick([[1, 0.125], [1, 0.375], [1, 0.625], [1, 0.875]])],
  [5, () => int(0, 400) + pick([[1, 0.005], [1, 0.015], [1, 0.045], [1, 0.555], [1, 0.995]])], [4, () => -int(1, 50000) / 100], [4, 0], [4, null],
  [3, "N/A"], [3, "$1,200.00"], [3, "250 CR"], [3, " 300 "], [2, "1_000"], [2, "1e3"], [2, "(100)"], [2, "-45.5"], [2, "$-12"], [2, true], [2, false],
  [2, () => rich("12", "5")], [2, () => ({ formula: "G2*0.1", result: int(1, 90000) / 100 })], [2, { formula: "G2*0.1" }], [2, "nan"], [1, ".5"], [1, "5."],
  [1, "+7"], [1, 1234567.891], [1, 0.005], [1, -0.004], [1, 1e-9], [1, () => d(2026, 5, 5)], [1, "١٢٣"], [1, "１２３"], [1, "1,2,3"], [1, "TBD"],
];
const PAIDS = [
  [50, null], [14, () => d(2026, int(3, 7), int(1, 28))], [8, () => d(2026, int(8, 12), int(1, 28))], [3, d(2026, 7, 31)], [3, () => d(2026, 7, 31, int(0, 23), int(1, 59))],
  [3, d(2026, 8, 1)], [3, "VOID"], [2, "void"], [2, "Voided 6/1"], [2, "REJECTED"], [2, "Rejected - resubmit"], [2, () => rich("VO", "ID")], [2, "PAID"],
  [2, () => 46100 + int(0, 200)], [1, "avoid"], [1, true], [1, 0], [1, "6/15/2026"], [1, { formula: "A1", result: d(2026, 6, 1) }], [1, () => d(1899, 12, 30, 9, 0)],
];
const ADJS = [
  [60, null], [5, "DEDUCTED 5/1/26"], [4, "DEDUCTED 9/15/26"], [3, "DEDUCTED 08/15/2026 - see note"], [3, "DEDUCTED 7/31/26"], [3, "DEDUCTED 8/1/26"],
  [3, "Deducted 5/1/26"], [2, "deducted 9/1/26"], [2, "DEDUCTED 5/1/26 - DEDUCTED 9/1/26"], [2, "DEDUCTED 9/1/26, DEDUCTED 5/1/26"], [2, () => rich("DEDUCTED ", "9/1/26")],
  [2, () => rich("DEDUCTED ", "5/1/26")], [2, "ADJ 6/1"], [2, "week 23"], [2, () => d(2026, 6, 1)], [1, "DEDUCTED 5/1/2026"], [1, "DEDUCTED 10/1/2026"],
  [1, "RE-DEDUCTED 9/9/26 - again"], [1, "DEDUCTED  9/9/26  "], [1, "DEDUCTED 09/09/26-x-y"], [1, 12], [1, true], [1, "DEDUCTED9/9/26"],
  // these make the legacy app reject the whole workbook
  [0.25, "DEDUCTED 5/1/26 PAID BACK 6/5/26"], [0.25, "DEDUCTED"], [0.25, "DEDUCTED 2/30/26"], [0.25, "DEDUCTED 5-1-26"], [0.25, "DEDUCTED 5/1"], [0.25, "DEDUCTED 5/1/126"],
];
const HEADER_SETS = [
  [70, "Commission"], [8, "COMMISSION"], [6, "Commission Due"], [5, "Net commission"], [4, " Commission "], [3, () => rich("Comm", "ission")], [1, "Comm"],
];
const ADMINS = ["ACME", "FIRST CHOICE", "O'BRIEN & SONS", "A.B.C. WARRANTY", "ÉLAN", "TRI_STATE", "X-TRA", "N J AUTO GROUP"];

(async () => {
  const count = Number(countArg ?? 20);
  for (let n = 0; n < count; n++) {
    const wb = new ExcelJS.Workbook();
    const commCol = pick([[70, 9], [10, 7], [10, 10], [10, 6]]);
    const width = commCol + 4;
    const extraCommHeader = rnd() < 0.06 ? int(5, commCol - 1) : 0;
    const sheets = pick([[60, ["2026"]], [20, ["2025", "2026"]], [10, ["2026", "2027", "Summary"]], [10, ["Weekly 7 2026", "Notes"]]]);
    for (const name of sheets) {
      const ws = wb.addWorksheet(name);
      const hr = ws.getRow(1);
      for (let c = 1; c <= width; c++) hr.getCell(c).value = ["Date", "Agent", "Dealer", "Contract #"][c - 1] ?? `Col ${c}`;
      hr.getCell(commCol).value = pick(HEADER_SETS);
      hr.getCell(commCol + 1).value = "Date Paid";
      hr.getCell(commCol + 4).value = "Week Adjusted";
      if (extraCommHeader) hr.getCell(extraCommHeader).value = "Commission %";
      hr.font = { bold: true }; hr.height = 30;
      ws.getColumn(3).width = 28; ws.getColumn(commCol).width = 14;
      if (!/20\d\d/.test(name)) continue;
      const rows = int(0, 45);
      for (let r = 0; r < rows; r++) {
        if (rnd() < 0.03) { ws.getRow(ws.rowCount + 2); continue; } // gap
        const row = ws.getRow(ws.rowCount + 1);
        const set = (col, v, fmt) => { const c = row.getCell(col); c.value = v === undefined ? null : v; if (fmt) c.numFmt = fmt; };
        const date = pick(DATES);
        set(1, date, date instanceof Date ? pick([[8, "mm/dd/yyyy"], [1, "m/d/yy"], [1, "d-mmm-yy"]]) : undefined);
        set(2, pick(NAMES)); set(3, pick(NAMES)); set(4, pick(CONTRACTS));
        const comm = pick(COMMS);
        set(commCol, comm, typeof comm === "number" ? pick([[5, "#,##0.00"], [2, undefined], [1, '"$"#,##0.00']]) : undefined);
        if (extraCommHeader) set(extraCommHeader, int(1, 30) / 100);
        const paid = pick(PAIDS);
        set(commCol + 1, paid, paid instanceof Date || (paid && paid.result instanceof Date) ? "mm/dd/yyyy" : undefined);
        const adj = pick(ADJS);
        set(commCol + 4, adj, adj instanceof Date ? "mm/dd/yyyy" : undefined);
        const fill = pick(FILLS);
        if (fill) {
          const mode = pick([[80, "all"], [8, "notC"], [6, "few"], [6, "onlyC"]]);
          for (let c = 1; c <= width; c++) {
            if (mode === "notC" && c === 3) continue;
            if (mode === "few" && c > 2) continue;
            if (mode === "onlyC" && c !== 3) continue;
            row.getCell(c).fill = fill;
          }
          if (mode === "notC" && rnd() < 0.5) row.getCell(3).fill = pick(FILLS) ?? undefined;
        }
      }
    }
    const admin = `${ADMINS[n % ADMINS.length]} ${String(n + 1).padStart(3, "0")}`;
    await wb.xlsx.writeFile(path.join(outDir, `${admin} - Weekly 7.xlsx`));
  }
  console.log(`wrote ${count} workbooks to ${outDir}`);
})();
