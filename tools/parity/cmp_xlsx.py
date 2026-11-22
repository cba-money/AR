"""Compares the formatted workbooks written by the legacy formatter and by the suite,
part by part (ignores the zip container and the created/modified timestamps).
usage: python cmp_xlsx.py <out/label>"""
import sys, zipfile, re, os, glob
root = sys.argv[1]; same = diff = 0
for lp in sorted(glob.glob(os.path.join(root, "legacy", "*.xlsx"))):
    sp = os.path.join(root, "suite", os.path.basename(lp))
    if not os.path.exists(sp):
        print("MISSING in suite:", os.path.basename(lp)); diff += 1; continue
    a, b = zipfile.ZipFile(lp), zipfile.ZipFile(sp)
    names = sorted(set(a.namelist()) | set(b.namelist()))
    bad = []
    for n in names:
        if n == "docProps/core.xml": continue
        x = a.read(n) if n in a.namelist() else None
        y = b.read(n) if n in b.namelist() else None
        if x != y: bad.append(n)
    if bad: diff += 1; print("DIFFERENT", os.path.basename(lp), bad)
    else: same += 1
print(f"formatted workbooks: identical={same} different={diff}")
