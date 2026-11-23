"""Asks real CPython what float(), f"{x:,.2f}", str(), strptime(), sum(), sorted() and
werkzeug.secure_filename() return for a large set of awkward inputs.
usage: python gen_expected.py <out.json> [seed]"""
import json, math, random, struct, sys
from datetime import datetime
from werkzeug.utils import secure_filename

rng = random.Random(int(sys.argv[2]) if len(sys.argv) > 2 else 1)
out = {}

def num(x):  # JSON-safe float
    if isinstance(x, float) and (math.isnan(x) or math.isinf(x)):
        return {"special": repr(x)}
    return x

# ---- f"{x:,.2f}" and str(float)
floats = [0.0, -0.0, 0.005, 0.015, 0.025, 0.045, 0.125, 0.375, 0.625, 0.875, 1.005, 2.675, 1e15, 1e16, 1e21, 1e22, 123456789.125,
          -0.004, -0.005, -0.125, 999.995, 999999.995, 0.1 + 0.2, 1e-5, 1e-4, 1.5e-7, 5e-324, 1.7976931348623157e308, 4503599627370496.5,
          2.0 ** 44 + 0.125, 2.0 ** 45 + 0.125, 17592186044416.125, 0.994999999999, 0.995, 1234.5, 100.625, 12.125]
for _ in range(6000):
    k = rng.random()
    if k < 0.35: floats.append(rng.randint(-10_000_000, 10_000_000) / 100)
    elif k < 0.55: floats.append(rng.randint(-100000, 100000) + rng.choice([0.125, 0.375, 0.625, 0.875, 0.005, 0.015, 0.035, 0.045, 0.555, 0.995]))
    elif k < 0.7: floats.append(rng.uniform(-1e6, 1e6))
    elif k < 0.8: floats.append(rng.randint(-10**9, 10**9) / 1000)
    elif k < 0.9: floats.append(struct.unpack("<d", struct.pack("<Q", rng.getrandbits(64)))[0])
    else: floats.append(rng.uniform(-1, 1) * 10 ** rng.randint(-12, 22))
floats = [f for f in floats if not (math.isnan(f) or math.isinf(f))]
out["money"] = [[f, f"{f:,.2f}"] for f in floats]
out["float_str"] = [[f, str(f)] for f in floats]

# ---- float(str)
alphabet = "0123456789+-.eE_ $,NaIiFfnty()١٣５\t\u00a0x"
texts = ["", " ", "1", " 300 ", "1_000", "1__0", "_1", "1_", "1e3", "1E-3", ".5", "5.", ".", "+7", "-45.5", "nan", "NaN", "-nan", "inf", "-INF", "Infinity",
         "infinit", "1,000", "$5", "(100)", "250 CR", "N/A", "١٢٣", "１２３.５", "1e", "e5", "0x10", "1.2.3", "--1", "+-1", "1 2", "\u00a05\u00a0", "5\n", "1e400",
         "-1e400", "1e-400", "0.1e1_0", "1_e5", "1._5", "1.5_", "TBD", "True", "12abc", "\x1f7\x1c", "\u20077", "٣.٥e٢", "nan ", "in f", "1e+_5", "૧૨"]
for _ in range(6000):
    texts.append("".join(rng.choice(alphabet) for _ in range(rng.randint(1, 7))))
res = []
for t in texts:
    try: res.append([t, num(float(t))])
    except ValueError: res.append([t, None])
out["float"] = res

# ---- the DEDUCTED date loop
def deduct(s):
    for fmt in ("%m/%d/%y", "%m/%d/%Y"):
        try: return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError: pass
    return None
dates = ["5/1/26", "05/01/26", "5/1/2026", "12/31/99", "2/29/24", "2/29/25", "2/30/26", "13/1/26", "0/1/26", "1/0/26", "1/32/26", "5/ 1/26", " 5/1/26",
         "5/1/26 ", "5/1/126", "5/1/0026", "5/1/0000", "5/1/9999", "5/1/69", "5/1/68", "5/1/00", "5-1-26", "5/1", "", "5/1/26x", "05/001/26", "5/01/2",
         "5/1٢/26", "٥/1/26", "5/1/٢٦", "5/2٩/26", "5/３/26", "1/1/1", "10/10/10", "010/1/26", "5//26", "5/1/26/", "11/31/26", "4/31/2026", "2/29/1900", "2/29/2000", "5/1/20266"]
dchars = "0123456789/ -٢５"
for _ in range(8000):
    k = rng.random()
    if k < 0.5:
        dates.append(f"{rng.randint(0, 14)}/{rng.randint(0, 33)}/{rng.choice([rng.randint(0, 99), rng.randint(0, 9999), rng.randint(1900, 2100)])}")
    elif k < 0.75:
        dates.append(f"{rng.randint(1, 12):02d}/{rng.randint(1, 31):02d}/{rng.randint(0, 9999):0{rng.choice([2, 4])}d}")
    else:
        dates.append("".join(rng.choice(dchars) for _ in range(rng.randint(3, 10))))
out["deduct"] = [[s, deduct(s)] for s in dates]

# ---- sum() and plain accumulation
sums = []
for _ in range(1500):
    xs = [rng.choice([rng.randint(-10**7, 10**7) / 100, rng.uniform(-1e5, 1e5), 0.1, 0.2, 0.3, 1e16, -1e16, 1e-9]) for _ in range(rng.randint(0, 12))]
    sums.append([xs, sum(xs)])
out["sum"] = sums

# ---- string ordering (sorted by code point) and str.strip()
words = ["", "a", "A", "Z", "z", "_", "é", "É", "Ábaco", "abc", "ABC", "10", "9", " x", "ﬁ", "😀", "\uffff", "\U0001f600a", "\ud7ff", "ß", "ss", "a b", "a-b", "a_b", "Ä", "ä", "i", "İ", "ı"]
for _ in range(400):
    words.append("".join(rng.choice("aAbBzZ09 _-éÉß😀\uffffﬁ") for _ in range(rng.randint(0, 5))))
out["sorted"] = [words, sorted(words)]
strips = ["  a  ", "\ta\n", "\x0ba\x0c", "\x1ca\x1f", "\x85a\xa0", "\u2003a\u3000", "\u200ba\u200b", "\ufeffa", "\u1680a\u202f\u205f", " \u2028a\u2029 ", "a", "", "   "]
out["strip"] = [[s, s.strip()] for s in strips]

# ---- secure_filename + company name
names = ["ACME ar to 07.31.26.xlsx", "FIRST CHOICE ar to 07.31.26.xlsx", "O'BRIEN & SONS ar to 07.31.26.xlsx", "ÉLAN ar to 07.31.26.xlsx", "TRI_STATE ar to 1.2.26.xlsx",
         "A.B.C. WARRANTY ar to 07.31.26.xlsx", "processed.xlsx", ".hidden file.xlsx", "__x__ y.xlsx", "ñandú ß ﬁ ar.xlsx", "a\tb  c.xlsx", "X-TRA (2) ar to.xlsx",
         "日本 ar to 07.31.26.xlsx", "UNKNOWN ar to 07.31.26.xlsx", "A/B ar.xlsx", "..x.xlsx", "x..xlsx.", "Ça va ar.xlsx", "½ price ar.xlsx", "№1 ar.xlsx", "A—B ar.xlsx"]
nchars = "abcXYZ019 _.-&'()éñß日/\\\t½"
for _ in range(1500):
    names.append("".join(rng.choice(nchars) for _ in range(rng.randint(1, 12))) + ".xlsx")
def company(n):
    parts = f"0123abcd_{secure_filename(n)}".split("_")
    return parts[1]
out["secure"] = [[n, secure_filename(n), company(n)] for n in names]

json.dump(out, open(sys.argv[1], "w"), ensure_ascii=True)
print({k: len(v) for k, v in out.items()})
