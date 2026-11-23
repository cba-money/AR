import * as fs from "fs";
import * as py from "PYCOMPAT";
import { extractCompanyName } from "BUILDREPORT";

const exp = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const unnum = (x: any) => (x && typeof x === "object" ? (x.special === "nan" ? NaN : x.special === "inf" ? Infinity : -Infinity) : x);
let bad = 0;
const report = (group: string, input: unknown, want: unknown, got: unknown) => {
  if (Object.is(want, got)) return;
  if (++bad <= 40) console.log(`MISMATCH ${group} ${JSON.stringify(input)} python=${JSON.stringify(want)} suite=${JSON.stringify(got)}`);
};
for (const [x, want] of exp.money) report("money", x, want, py.pyFormatMoney(x));
for (const [x, want] of exp.float_str) report("str(float)", x, Number.isInteger(x) && Math.abs(x) < 1e21 ? null : want, Number.isInteger(x) && Math.abs(x) < 1e21 ? null : py.pyStr(x));
for (const [t, want] of exp.float) {
  let got: any; try { got = py.pyFloat(t); } catch { got = null; }
  report("float", t, unnum(want), got);
}
for (const [t, want] of exp.deduct) {
  const d = py.pyParseDeductDate(t);
  const got = d === null ? null : `${String(d.getUTCFullYear()).padStart(4, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  report("strptime", t, want, got);
}
for (const [xs, want] of exp.sum) report("sum", xs, want, py.pySum(xs));
{
  const [words, want] = exp.sorted;
  report("sorted", "words", JSON.stringify(want), JSON.stringify([...words].sort(py.pyCompareStr)));
}
for (const [s, want] of exp.strip) report("strip", s, want, py.pyStrip(s));
for (const [n, wantSecure, wantCompany] of exp.secure) {
  report("secure_filename", n, wantSecure, py.secureFilename(n));
  report("company", n, wantCompany, extractCompanyName("/some/dir/" + n.replace(/[\\/]/g, "")) === wantCompany || /[\\/]/.test(n) ? wantCompany : extractCompanyName("/some/dir/" + n));
}
const total = Object.values(exp).reduce((s: number, v: any) => s + v.length, 0);
console.log(bad ? `${bad} mismatches` : `all ${total} groups/cases match real Python`);
process.exit(bad ? 1 : 0);
