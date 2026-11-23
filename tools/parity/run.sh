#!/usr/bin/env bash
# Differential run: legacy pipeline (ar-formatter -> ar-app) vs. this repo's formatter + processor.
# Every workbook in the input folder goes through both; the report HTML that would be turned
# into the PDF is compared byte for byte. A workbook the legacy app rejects (no PDF) must be
# rejected by the suite too.
#
# usage: run.sh [label] [time zone]
# env:   LEGACY_FORMATTER  checkout of tyler-ruff-cba/ar-formatter (default: ../../../ar-formatter)
#        LEGACY_APP        checkout of tyler-ruff-cba/ar-app       (default: ../../../ar-app)
#        INPUTS            folder of "<ADMIN> - Weekly 7.xlsx" files (default: ./inputs)
#        ARDATE            A/R date, MM/DD/YYYY                      (default: 07/31/2026)
#        AR_REPO           suite checkout to test                    (default: this repo)
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
AR="${AR_REPO:-$HERE/../..}"; LABEL="${1:-current}"; export TZ="${2:-America/New_York}"
FMT="${LEGACY_FORMATTER:-$HERE/../../../ar-formatter}"; APP="${LEGACY_APP:-$HERE/../../../ar-app}"
for d in "$FMT/processor/excelProcessor.js" "$APP/app.py"; do
  [ -f "$d" ] || { echo "missing legacy source: $d (set LEGACY_FORMATTER / LEGACY_APP)"; exit 2; }
done
INPUTS="${INPUTS:-$HERE/inputs}"
[ -d "$INPUTS" ] || node "$HERE/gen.cjs" >/dev/null
OUT="$HERE/out/$LABEL"; rm -rf "$OUT"; mkdir -p "$OUT/legacy" "$OUT/suite" "$HERE/build"
node "$HERE/build_suite.cjs" "$AR" "$HERE/build/suite_$LABEL.cjs" || exit 1
pass=0; fail=0
for f in "$INPUTS"/*.xlsx; do
  admin="$(basename "$f" | sed 's/ - Weekly 7.xlsx//')"
  ardate="${ARDATE:-07/31/2026}"; [ "$admin" = "KILO" ] && ardate="01/31/2027"
  # the desktop suite derives the range itself: A/R month plus the three months before it
  read -r ranges months fname <<<"$(node -e '
    const [m,d,y]=process.argv[1].split("/").map(Number); const r=[],n=[];
    for(let i=3;i>=0;i--){const dt=new Date(y,m-1-i,1); r.push(String(dt.getMonth()+1).padStart(2,"0")+"/"+dt.getFullYear()); n.push(dt.getMonth()+1);}
    console.log(r.join(","), n.join(","), process.argv[1].split("/").map((x,i)=>i==2?x.slice(-2):x).join("."));' "$ardate")"
  legacy_xlsx="$OUT/legacy/$admin ar to $fname.xlsx"
  node "$HERE/legacy_format.cjs" "$FMT" "$f" "$ranges" "$legacy_xlsx" >/dev/null
  l="$(python3 "$HERE/legacy_process.py" "$APP" "$legacy_xlsx" "$ardate" "$months" "$OUT/legacy/$admin.html")"
  s="$(node "$HERE/build/suite_$LABEL.cjs" "$f" "$ardate" "$OUT/suite" "$OUT/suite/$admin.html")"
  if cmp -s "$OUT/legacy/$admin.html" "$OUT/suite/$admin.html"; then r="IDENTICAL"; pass=$((pass+1)); else r="DIFFERENT"; fail=$((fail+1)); fi
  printf '%-9s %-10s legacy: %-60s suite: %s\n' "$admin" "$r" "$l" "$s"
done
echo "TZ=$TZ  identical=$pass  different=$fail"
python3 "$HERE/cmp_xlsx.py" "$OUT" | tail -5
[ "$fail" -eq 0 ]
