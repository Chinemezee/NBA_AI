"""
One-time script: uploads nba_player_game_logs.csv to Supabase via REST API.
Uses only `requests` and `pandas` — no supabase client needed.
Run once: python migrate_to_supabase.py
"""
import os
import time
import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit("Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env first.")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",  # upsert behaviour
}

df = pd.read_csv("nba_player_game_logs.csv")
df["GAME_DATE"] = pd.to_datetime(df["GAME_DATE"]).dt.strftime("%Y-%m-%d")
df = df.drop_duplicates(subset=["PLAYER_ID", "GAME_ID"], keep="last")

# Cast integer columns (CSV stores them as floats like 4.0)
int_cols = ["PLAYER_ID", "PTS", "AST", "REB", "STL", "BLK", "OREB", "DREB",
            "FG3M", "FG3A", "FTM", "FTA", "TOV"]
for col in int_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

records = [
    {k.lower(): (None if pd.isna(v) else v) for k, v in row.items()}
    for row in df.to_dict("records")
]

BATCH = 500
total = len(records)
print(f"Uploading {total} rows in batches of {BATCH}...")

for i in range(0, total, BATCH):
    batch = records[i : i + BATCH]
    for attempt in range(3):
        try:
            resp = requests.post(
                f"{SUPABASE_URL}/rest/v1/nba_player_game_logs",
                headers=HEADERS,
                json=batch,
                timeout=30,
            )
            if resp.status_code not in (200, 201):
                print(f"  ERROR at batch {i}: {resp.status_code} {resp.text[:200]}")
                raise SystemExit("Migration failed.")
            break
        except requests.exceptions.ConnectionError as e:
            if attempt < 2:
                print(f"  Connection error at batch {i}, retrying... ({e})")
                time.sleep(3)
            else:
                raise
    print(f"  {min(i + BATCH, total)}/{total} rows uploaded")
    time.sleep(0.1)  # small pause between batches

print("Migration complete.")
