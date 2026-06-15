# -*- coding: utf-8 -*-
import re, os, sys
sys.stdout.reconfigure(encoding='utf-8')

DIR = r"c:\Users\user\Downloads\payroll helper"
FFFD = '�'

# The box-drawing line characters used in comments (─ ━ ═ etc) are valid - ignore those
# We want to find:
# 1. FFFD (replacement char) in UI-visible strings (not just // comments)
# 2. ? before digits or { in non-operator context

files = []
for root, dirs, fns in os.walk(DIR):
    for fn in fns:
        if fn.endswith('.jsx'):
            files.append(os.path.join(root, fn))
files.sort()

total_issues = 0
for path in files:
    name = os.path.basename(path)
    txt = open(path, encoding='utf-8', errors='replace').read()

    # Find FFFD NOT on comment-only lines (lines starting with //)
    ui_fffd = []
    for i, line in enumerate(txt.splitlines(), 1):
        stripped = line.strip()
        if FFFD in line:
            # Skip pure comment lines
            if not stripped.startswith('//') and not stripped.startswith('*'):
                ui_fffd.append((i, line.strip()[:100]))

    # Rupee ? before digit or {, not preceded by space/operator
    rupee_bad = [(m.start(), txt[max(0,m.start()-30):m.start()+40])
                 for m in re.finditer(r'(?<![? .\t\n><=!,;:({+\-*/\\])\?(?=[0-9{])', txt)]

    if ui_fffd or rupee_bad:
        total_issues += len(ui_fffd) + len(rupee_bad)
        print(f"\n=== {name} ===")
        for lineno, line in ui_fffd[:5]:
            print(f"  FFFD L{lineno}: {line}")
        for pos, ctx in rupee_bad[:5]:
            print(f"  rupee? [{pos}]: {ctx.strip()}")
        if len(ui_fffd) > 5:
            print(f"  ... and {len(ui_fffd)-5} more FFFD lines")

if total_issues == 0:
    print("All files clean — no garbled characters found in UI code.")
else:
    print(f"\nTotal issues: {total_issues}")
