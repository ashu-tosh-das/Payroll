import os, re

DIR = r"c:\Users\user\Downloads\payroll helper"

# Real garbled double-encoded patterns (Windows-1252 chars read as UTF-8 then re-encoded)
GARBLED = re.compile(r'Ã©|Ã¨|Ã |â€[–—™œ""•]|â€™|Â·|â‚¹|ï»¿|\?(?=[0-9]{1,3}[,K])')
# Rupee as ? before digit or { — not preceded by operator/space
RUPEE   = re.compile(r'(?<![? .\t\n><=!,;:({+\-*/\\])\?(?=[0-9{])')

results = []
for root, dirs, files in os.walk(DIR):
    for fn in sorted(files):
        if not fn.endswith('.jsx'):
            continue
        path = os.path.join(root, fn)
        txt = open(path, encoding='utf-8', errors='replace').read()
        g_matches = list(GARBLED.finditer(txt))
        r_matches = list(RUPEE.finditer(txt))
        if g_matches or r_matches:
            results.append((fn, g_matches, r_matches, txt))

if not results:
    print("All clean - no garbled characters or rupee symbols found.")
else:
    for fn, g_matches, r_matches, txt in results:
        print(f"\n=== {fn} ===")
        if g_matches:
            vals = list(set(m.group() for m in g_matches))
            print(f"  garbled chars ({len(g_matches)}): {vals[:8]}")
            for m in g_matches[:4]:
                ctx = txt[max(0,m.start()-40):m.start()+50].replace('\n',' ')
                print(f"    [{m.start()}] ...{ctx}...")
        if r_matches:
            print(f"  rupee? ({len(r_matches)})")
            for m in r_matches[:4]:
                ctx = txt[max(0,m.start()-40):m.start()+50].replace('\n',' ')
                print(f"    [{m.start()}] ...{ctx}...")
