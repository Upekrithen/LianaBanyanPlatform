"""Inspect the R11v2 question bank fully."""
import json

bpath = "r10_cross_vendor/R11v2_QUESTION_BANK_SEALED_K528.json"
bank = json.load(open(bpath))
print("Top-level keys:", list(bank.keys()))
for k, v in bank.items():
    print(f"  {k}: {type(v).__name__} = {str(v)[:80]}")
