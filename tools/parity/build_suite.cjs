// Bundles the A/R Desktop Suite's formatter + processor (TypeScript) into a plain Node
// script, replacing only the Electron settings store and the Puppeteer PDF step so the
// report HTML can be captured.  usage: node build_suite.cjs <AR repo> <out.cjs>
const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");
const [repo, out] = process.argv.slice(2);
const src = path.join(path.resolve(repo), "src", "electron");
const stubDir = path.join(__dirname, "build", "stubs");
fs.mkdirSync(stubDir, { recursive: true });
fs.writeFileSync(path.join(stubDir, "generatePdf.ts"), `
import * as fs from "fs";
export async function generatePdfLocally(html: string, outputPdfPath: string): Promise<void> {
  (globalThis as any).__capturedHtml = html;
  fs.writeFileSync(outputPdfPath, "%PDF-1.4 stub");
}`);
fs.writeFileSync(path.join(stubDir, "settings.ts"), `export const settingsManager = { get: (_k: string) => "", getStore: () => ({}) };`);
const entry = path.join(stubDir, "entry.ts");
fs.writeFileSync(entry, `
import * as fs from "fs";
import * as path from "path";
import { formatWorkbook } from ${JSON.stringify(path.join(src, "modules/formatter/formatFiles.ts"))};
import { processARFile } from ${JSON.stringify(path.join(src, "modules/processor/processFiles.ts"))};
import * as batchUtil from ${JSON.stringify(path.join(src, "lib/batch/util.ts"))};

// Mirrors BatchJobRunner.start() for one file.
async function main() {
  const [input, arDate, outDir, outHtml] = process.argv.slice(2);
  const monthRange = batchUtil.getMonthRange(arDate, 3);
  const b: any = batchUtil;
  const givenDate: Date = typeof b.parseArDate === "function" ? b.parseArDate(arDate) : new Date(arDate);
  try {
    const formatted = await formatWorkbook(input, batchUtil.buildMonthRangeString(monthRange), arDate, outDir);
    const res: any = await processARFile(formatted, givenDate, batchUtil.extractMonthsAsNumbers(monthRange));
    if (!res) throw new Error("processARFile returned null");
    fs.writeFileSync(outHtml, (globalThis as any).__capturedHtml);
    try { fs.unlinkSync(res.fileName); } catch {}
    console.log("OK rows=" + res.rows + " grand=" + res.grandTotal.toFixed(2));
  } catch (e: any) {
    fs.writeFileSync(outHtml, "NO PDF PRODUCED\\n");
    console.log("FAILED " + (e?.message ?? e));
  }
}
main();`);
const stubPlugin = {
  name: "stubs",
  setup(build) {
    build.onResolve({ filter: /generatePdf(\.js)?$/ }, () => ({ path: path.join(stubDir, "generatePdf.ts") }));
    build.onResolve({ filter: /settings(\.js)?$/ }, () => ({ path: path.join(stubDir, "settings.ts") }));
    // TS sources import "./x.js"; map back to "./x.ts"
    build.onResolve({ filter: /^\.{1,2}\/.*\.js$/ }, (args) => {
      const ts = path.join(args.resolveDir, args.path.replace(/\.js$/, ".ts"));
      return fs.existsSync(ts) ? { path: ts } : undefined;
    });
  },
};
esbuild.build({
  entryPoints: [entry], bundle: true, platform: "node", format: "cjs", outfile: out,
  external: ["exceljs", "puppeteer", "electron", "electron-store"], logLevel: "error",
  plugins: [stubPlugin],
}).catch(() => process.exit(1));
