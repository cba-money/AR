#!/usr/bin/env bash
# Checks the Python-compatibility helpers (pyCompat.ts) against a real Python interpreter.
# usage: primitives/run.sh [seed]     (needs: python3 with werkzeug)
set -eu
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HERE/../build"
python3 "$HERE/gen_expected.py" "$HERE/expected.json" "${1:-1}"
node "$HERE/build_check.cjs" "${AR_REPO:-$HERE/../../..}" "$HERE/../build/check.cjs"
node "$HERE/../build/check.cjs" "$HERE/expected.json"
