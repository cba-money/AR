// Bundles check.ts against this repo's pyCompat.ts / buildReport.ts.  usage: node build_check.cjs <AR repo> <out.cjs>
const esbuild = require("esbuild");
const path = require("path");
const [repo, out] = process.argv.slice(2);
const proc = path.join(path.resolve(repo), "src/electron/modules/processor");
esbuild.build({
  entryPoints: [path.join(__dirname, "check.ts")], bundle: true, platform: "node", format: "cjs", outfile: out,
  external: ["exceljs"], logLevel: "error",
  alias: { PYCOMPAT: path.join(proc, "pyCompat.ts"), BUILDREPORT: path.join(proc, "buildReport.ts") },
  plugins: [{ name: "js2ts", setup(b) { b.onResolve({ filter: /^\.{1,2}\/.*\.js$/ }, a => ({ path: path.join(a.resolveDir, a.path.replace(/\.js$/, ".ts")) })); } }],
}).catch(() => process.exit(1));
