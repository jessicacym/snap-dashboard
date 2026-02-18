"""
Generate snap-monthly-data.js and snap-demographics.js from CSV sources.
"""

import csv
import json
from collections import OrderedDict

# ---------------------------------------------------------------------------
# 50 states + DC  (full name -> abbreviation)
# ---------------------------------------------------------------------------
STATE_ABBR = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT",
    "Delaware": "DE", "District of Columbia": "DC", "Florida": "FL",
    "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL",
    "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY",
    "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN",
    "Mississippi": "MS", "Missouri": "MO", "Montana": "MT",
    "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
    "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
    "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
    "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
    "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
    "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
    "Wisconsin": "WI", "Wyoming": "WY",
}
ABBR_STATE = {v: k for k, v in STATE_ABBR.items()}

VALID_FULL_NAMES = set(STATE_ABBR.keys())   # 51 entries
VALID_ABBRS = set(STATE_ABBR.values())       # 51 entries

# Desired month order for FY2023
MONTH_ORDER = [
    "Oct 2022", "Nov 2022", "Dec 2022",
    "Jan 2023", "Feb 2023", "Mar 2023",
    "Apr 2023", "May 2023", "Jun 2023",
    "Jul 2023", "Aug 2023", "Sep 2023",
]

# ---------------------------------------------------------------------------
# File 1: SNAP_MONTHLY
# ---------------------------------------------------------------------------
CSV1 = r"C:\Users\User\Downloads\csv1_fy2023_state_monthly_participation.csv"
OUT1 = r"C:\Users\User\snap-dashboard\snap-monthly-data.js"

monthly = {}  # state_name -> { month_label -> { ... } }

with open(CSV1, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        state = row["State"].strip()
        if state not in VALID_FULL_NAMES:
            continue
        month = row["Month"].strip()
        monthly.setdefault(state, {})[month] = {
            "persons": int(row["Persons"]),
            "households": int(row["Households"]),
            "benefits": int(row["Total_Benefits_USD"]),
            "avgBenefitPerson": round(float(row["Avg_Benefit_Per_Person"]), 2),
        }

# Sort states alphabetically; order months chronologically
monthly_sorted = OrderedDict()
for state in sorted(monthly.keys()):
    monthly_sorted[state] = OrderedDict()
    for m in MONTH_ORDER:
        if m in monthly[state]:
            monthly_sorted[state][m] = monthly[state][m]

# Build JS text
js1_lines = []
js1_lines.append("/* State monthly SNAP participation (FY2023) */")
js1_lines.append("// eslint-disable-next-line no-unused-vars")
js1_lines.append("const SNAP_MONTHLY = {")

state_list = list(monthly_sorted.keys())
for si, state in enumerate(state_list):
    js1_lines.append(f'  "{state}": {{')
    months = list(monthly_sorted[state].items())
    for mi, (month, d) in enumerate(months):
        trailing = "," if mi < len(months) - 1 else ""
        js1_lines.append(
            f'    "{month}": {{ persons: {d["persons"]}, households: {d["households"]}, '
            f'benefits: {d["benefits"]}, avgBenefitPerson: {d["avgBenefitPerson"]} }}{trailing}'
        )
    trailing_state = "," if si < len(state_list) - 1 else ""
    js1_lines.append(f"  }}{trailing_state}")

js1_lines.append("};")
js1_lines.append("")

with open(OUT1, "w", encoding="utf-8") as f:
    f.write("\n".join(js1_lines))

print(f"[File 1] Wrote {OUT1}")
print(f"  States: {len(monthly_sorted)}")
sample_state = "Alabama"
sample_month = "Oct 2022"
print(f"  Sample -- {sample_state} / {sample_month}: {monthly_sorted[sample_state][sample_month]}")

# ---------------------------------------------------------------------------
# File 2: SNAP_DEMOGRAPHICS
# ---------------------------------------------------------------------------
CSV2 = r"C:\Users\User\Downloads\csv2_demographics_long.csv"
OUT2 = r"C:\Users\User\snap-dashboard\snap-demographics.js"

CATEGORY_ORDER = [
    "Households with Children",
    "Households with Elderly",
    "Households with Disabled",
    "Single Person Households",
    "Children Under 18",
    "Adults 18-59",
    "Elderly 60+",
]

demo = {}  # abbr -> { category -> pct }

with open(CSV2, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        abbr = row["State_Abbr"].strip()
        if abbr not in VALID_ABBRS:
            continue
        cat = row["Demographic_Category"].strip()
        pct = round(float(row["Percentage"]), 1)
        demo.setdefault(abbr, {})[cat] = pct

# Sort by abbreviation
demo_sorted = OrderedDict((k, demo[k]) for k in sorted(demo.keys()))

js2_lines = []
js2_lines.append("/* State SNAP demographics (FY2023) */")
js2_lines.append("// eslint-disable-next-line no-unused-vars")
js2_lines.append("const SNAP_DEMOGRAPHICS = {")

abbr_list = list(demo_sorted.keys())
for ai, abbr in enumerate(abbr_list):
    js2_lines.append(f"  {abbr}: [")
    cats = demo_sorted[abbr]
    for ci, cat in enumerate(CATEGORY_ORDER):
        pct = cats.get(cat, 0.0)
        trailing = "," if ci < len(CATEGORY_ORDER) - 1 else ""
        js2_lines.append(f'    {{ category: "{cat}", pct: {pct} }}{trailing}')
    trailing_abbr = "," if ai < len(abbr_list) - 1 else ""
    js2_lines.append(f"  ]{trailing_abbr}")

js2_lines.append("};")
js2_lines.append("")

with open(OUT2, "w", encoding="utf-8") as f:
    f.write("\n".join(js2_lines))

print(f"\n[File 2] Wrote {OUT2}")
print(f"  States: {len(demo_sorted)}")
sample_abbr = "AL"
print(f"  Sample -- {sample_abbr}: {[{'category': c, 'pct': demo_sorted[sample_abbr].get(c, 0)} for c in CATEGORY_ORDER]}")

# ---------------------------------------------------------------------------
# Final validation
# ---------------------------------------------------------------------------
print("\n--- Validation ---")
assert len(monthly_sorted) == 51, f"Expected 51 states in SNAP_MONTHLY, got {len(monthly_sorted)}"
assert len(demo_sorted) == 51, f"Expected 51 states in SNAP_DEMOGRAPHICS, got {len(demo_sorted)}"
for state in monthly_sorted:
    assert len(monthly_sorted[state]) == 12, f"{state} has {len(monthly_sorted[state])} months, expected 12"
for abbr in demo_sorted:
    assert len(demo_sorted[abbr]) == 7, f"{abbr} has {len(demo_sorted[abbr])} categories, expected 7"
print("All assertions passed: 51 states, 12 months each, 7 categories each.")
