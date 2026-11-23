// Runs the UNMODIFIED legacy formatter (tyler-ruff-cba/ar-formatter) on one workbook.
// usage: node legacy_format.cjs <formatterRepo> <input.xlsx> <dateRanges> <output.xlsx>
const path = require("path");
const fs = require("fs");
const [repo, input, ranges, output] = process.argv.slice(2);
const { processWorkbook } = require(path.join(path.resolve(repo), "processor", "excelProcessor.js"));
const log = console.log; console.log = () => {};
processWorkbook(input, ranges).then((tmp) => {
  fs.copyFileSync(tmp, output);
  fs.unlinkSync(tmp);
  log(output);
}).catch((e) => { console.error("LEGACY FORMAT ERROR", e); process.exit(1); });
