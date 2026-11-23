# Legacy parity harness

Proves that this app produces exactly what the two legacy tools produce:

```
Weekly 7.xlsx ──► ar-formatter (excelProcessor.js) ──► ar-app (app.py) ──► report HTML ──► PDF
Weekly 7.xlsx ──► formatter/formatFiles.ts         ──► processor/buildReport.ts ──► report HTML ──► PDF
```

Both pipelines run on the same workbooks. The legacy code is executed unmodified from its own
checkout; only the last step (HTML to PDF) is replaced so the report HTML can be captured and
compared byte for byte. The intermediate formatted workbooks are compared part by part too.
A workbook the legacy app rejects (no PDF) has to be rejected by this app as well.

## Setup

```
git clone https://github.com/tyler-ruff-cba/ar-formatter ../ar-formatter && (cd ../ar-formatter && npm install)
git clone https://github.com/tyler-ruff-cba/ar-app ../ar-app
pip install openpyxl flask requests werkzeug
npm install            # in this repo
```

Paths above are relative to the repo root (the legacy checkouts sit next to this repo). Use
`LEGACY_FORMATTER` / `LEGACY_APP` to point somewhere else. Needs bash (Git Bash or WSL on Windows).

## Run

```
tools/parity/run.sh                                  # built-in edge-case workbooks, Eastern time
tools/parity/run.sh utc UTC                          # same, with the PC clock set to UTC
INPUTS="C:/path/to/real/weekly7" ARDATE=07/31/2026 tools/parity/run.sh real

node tools/parity/fuzz.cjs tools/parity/fuzz_1 60 1  # 60 random workbooks, seed 1
INPUTS=tools/parity/fuzz_1 tools/parity/run.sh fuzz_1

tools/parity/primitives/run.sh                       # Python built-ins vs. pyCompat.ts
```

Results land in `tools/parity/out/<label>/{legacy,suite}/`. Diff the two `.html` files of any
workbook reported as `DIFFERENT` to see the exact rows that disagree. The script exits non-zero
when anything differs.

Input files must be named `<ADMIN> - Weekly 7.xlsx`. The month range is derived the way the app
derives it (A/R month plus the three months before it) and the same range is given to the legacy
tools.

## Files

| File | Purpose |
| --- | --- |
| `gen.cjs` | Writes the built-in workbooks (`ALPHA` ... `KILO`), one per known divergence |
| `fuzz.cjs` | Writes random workbooks from pools of awkward cell contents |
| `legacy_format.cjs` | Runs the legacy formatter |
| `legacy_process.py` | Runs the legacy processor, including the Flask upload file naming |
| `build_suite.cjs` | Bundles this repo's formatter + processor into a Node script |
| `cmp_xlsx.py` | Compares the formatted workbooks |
| `primitives/` | Checks `pyCompat.ts` against a real Python interpreter |
