"""Runs the UNMODIFIED legacy processor (tyler-ruff-cba/ar-app app.py) on one formatted
workbook, reproducing the Flask upload step (secure_filename + uuid prefix) and capturing
the HTML that would have been posted to the PDF service.

usage: python legacy_process.py <ar-app repo> <formatted.xlsx> <MM/DD/YYYY> <months csv> <out.html>
"""
import os, sys, shutil, uuid, io, contextlib, importlib.util
from datetime import datetime

repo, formatted, given, months, out_html = sys.argv[1:6]

spec = importlib.util.spec_from_file_location("legacy_app", os.path.join(repo, "app.py"))
legacy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy)

captured = {}

class _Resp:
    content = b"%PDF-1.4 stub"

def _fake_post(url, json=None, **kw):
    captured["html"] = json["html"]
    return _Resp()

legacy.requests.post = _fake_post

# -- exactly what upload_file() does -------------------------------------------------
given_date = datetime.strptime(given.strip(), "%m/%d/%Y")
months_to_process = legacy.parse_months(months)
filename = legacy.secure_filename(os.path.basename(formatted))
unique_name = f"{uuid.uuid4().hex}_{filename}"
save_path = os.path.join(legacy.app.config["UPLOAD_FOLDER"], unique_name)
shutil.copyfile(formatted, save_path)

buf = io.StringIO()
with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
    result = legacy.process_excel_to_pdf(unique_name, given_date, months_to_process)
log = buf.getvalue()

for p in (save_path, save_path.replace(".xlsx", "-PROCESSED.pdf")):
    try: os.remove(p)
    except OSError: pass

if result is None:
    reason = [l for l in log.splitlines() if l.startswith("✗")]
    with open(out_html, "w", encoding="utf-8") as f:
        f.write("NO PDF PRODUCED\n")
    print("FAILED", " | ".join(reason))
else:
    with open(out_html, "w", encoding="utf-8") as f:
        f.write(captured["html"])
    print("OK rows=%d grand=%.2f" % (result["rows"], result["grand_total"]))
