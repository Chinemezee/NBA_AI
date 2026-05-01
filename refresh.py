"""
Run this locally to fetch new NBA game logs and upsert them to Supabase.
Uses ESPN's unofficial public API — no auth, no IP restrictions.

First run: detects existing NBA API data, clears Supabase, re-seeds full season.
Subsequent runs: incremental update from last known date.

Usage:
    python refresh.py
"""

import os
import time
import requests
import pandas as pd
from datetime import date, timedelta
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba'

# ESPN uses shortened abbreviations for some teams — map to standard 3-letter codes
_ABBR_FIX = {
    'GS':  'GSW',
    'NO':  'NOP',
    'NY':  'NYK',
    'SA':  'SAS',
    'PHO': 'PHX',
    'UTH': 'UTA',
    'WSH': 'WAS',
    'BKN': 'BKN',
}


def fix_abbr(abbr: str) -> str:
    return _ABBR_FIX.get(abbr, abbr)


def current_season_start() -> date:
    """Return Oct 1 of the current NBA season start year."""
    today = date.today()
    year = today.year if today.month >= 10 else today.year - 1
    return date(year, 10, 1)


def current_season_label() -> str:
    today = date.today()
    start = today.year if today.month >= 10 else today.year - 1
    return f"{start}-{str(start + 1)[2:]}"


def load_from_supabase(sb) -> pd.DataFrame:
    rows, page, size = [], 0, 1000
    while True:
        resp = sb.table('nba_player_game_logs').select('*').range(
            page * size, (page + 1) * size - 1
        ).execute()
        batch = resp.data
        if not batch:
            break
        rows.extend(batch)
        if len(batch) < size:
            break
        page += 1
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows)


def is_nba_api_data(df) -> bool:
    """NBA API game IDs are 10-digit strings starting with '00'."""
    if df.empty:
        return False
    col = 'game_id' if 'game_id' in df.columns else 'GAME_ID'
    sample = str(df[col].iloc[0])
    return len(sample) == 10 and sample.startswith('00')


def parse_minutes(val) -> float:
    s = str(val or '0')
    if ':' in s:
        try:
            m, sec = s.split(':')
            return round(int(m) + int(sec) / 60, 1)
        except Exception:
            return 0.0
    try:
        return round(float(s), 1)
    except Exception:
        return 0.0


def safe_int(val) -> int:
    try:
        return int(val or 0)
    except Exception:
        return 0


def parse_shooting(stat: str):
    """Parse 'made-attempted' string → (made, attempted, pct)."""
    try:
        m, a = stat.split('-')
        made = int(m)
        att  = int(a)
        pct  = round(made / att, 3) if att > 0 else 0.0
        return made, att, pct
    except Exception:
        return 0, 0, 0.0


def _get(session, url, params, timeout=45, retries=3) -> requests.Response:
    """GET with retries on timeout or connection error."""
    for attempt in range(retries):
        try:
            resp = session.get(url, params=params, timeout=timeout)
            resp.raise_for_status()
            return resp
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(10)
            else:
                raise


def get_completed_game_ids(session, date_str: str) -> list:
    """Return list of completed ESPN game IDs for a YYYYMMDD date string."""
    resp = _get(session, f'{ESPN_BASE}/scoreboard', params={'dates': date_str})
    events = resp.json().get('events', [])
    return [
        e['id'] for e in events
        if e.get('status', {}).get('type', {}).get('completed', False)
    ]


def get_player_rows(session, game_id: str, game_date: str) -> list:
    """Fetch ESPN box score and return one dict per player."""
    resp = _get(session, f'{ESPN_BASE}/summary', params={'event': game_id})
    resp.raise_for_status()
    data = resp.json()

    # Scores and teams from header
    competition = data['header']['competitions'][0]
    competitors  = competition['competitors']
    home = next(c for c in competitors if c['homeAway'] == 'home')
    away = next(c for c in competitors if c['homeAway'] == 'away')
    home_abbr  = fix_abbr(home['team'].get('abbreviation', ''))
    away_abbr  = fix_abbr(away['team'].get('abbreviation', ''))
    home_score = safe_int(home.get('score', 0))
    away_score = safe_int(away.get('score', 0))

    rows = []
    for team_block in data.get('boxscore', {}).get('players', []):
        team_abbr = fix_abbr(team_block['team'].get('abbreviation', ''))
        is_home   = team_abbr == home_abbr
        opp_abbr  = away_abbr if is_home else home_abbr
        matchup   = f"{team_abbr} vs. {opp_abbr}" if is_home else f"{team_abbr} @ {opp_abbr}"
        wl        = ('W' if home_score > away_score else 'L') if is_home \
                    else ('W' if away_score > home_score else 'L')

        for stat_group in team_block.get('statistics', []):
            names = stat_group.get('names', [])
            for entry in stat_group.get('athletes', []):
                if entry.get('didNotPlay', False):
                    continue
                raw = entry.get('stats', [])
                if not raw:
                    continue

                s = dict(zip(names, raw))
                _,    _,    fg_pct  = parse_shooting(s.get('FG',  '0-0'))
                fg3m, fg3a, fg3_pct = parse_shooting(s.get('3PT', '0-0'))
                ftm,  fta,  _       = parse_shooting(s.get('FT',  '0-0'))

                player_id = entry['athlete'].get('id')
                if not player_id:
                    continue
                rows.append({
                    'player_id':         int(player_id),
                    'game_id':           game_id,
                    'game_date':         game_date,
                    'player_name':       entry['athlete']['displayName'],
                    'team_abbreviation': team_abbr,
                    'matchup':           matchup,
                    'wl':                wl,
                    'min':               parse_minutes(s.get('MIN')),
                    'pts':               safe_int(s.get('PTS')),
                    'ast':               safe_int(s.get('AST')),
                    'reb':               safe_int(s.get('REB')),
                    'stl':               safe_int(s.get('STL')),
                    'blk':               safe_int(s.get('BLK')),
                    'oreb':              safe_int(s.get('OREB')),
                    'dreb':              safe_int(s.get('DREB')),
                    'fg_pct':            fg_pct,
                    'fg3m':              fg3m,
                    'fg3a':              fg3a,
                    'fg3_pct':           fg3_pct,
                    'ftm':               ftm,
                    'fta':               fta,
                    'tov':               safe_int(s.get('TO')),
                })
    return rows


def fetch_date_range(session, start: date, end: date) -> list:
    """Fetch all player stats for every game between start and end dates."""
    all_rows = []
    d = start
    while d <= end:
        date_str = d.strftime('%Y%m%d')
        try:
            game_ids = get_completed_game_ids(session, date_str)
            if game_ids:
                print(f"  {d.isoformat()}: {len(game_ids)} game(s)")
                for gid in game_ids:
                    try:
                        rows = get_player_rows(session, gid, d.isoformat())
                        all_rows.extend(rows)
                    except Exception as e:
                        print(f"    game {gid} failed: {e}")
                    time.sleep(0.5)
        except Exception as e:
            print(f"  {d.isoformat()}: scoreboard failed — {e}")
        d += timedelta(days=1)
        time.sleep(1)
    return all_rows


def run():
    sb_url = os.getenv("SUPABASE_URL", "")
    sb_key = os.getenv("SUPABASE_SERVICE_KEY", "")
    if not sb_url or not sb_key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
        return

    sb      = create_client(sb_url, sb_key)
    session = requests.Session()
    session.headers['User-Agent'] = (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    )

    print(f"Season: {current_season_label()}")
    print("Loading current data from Supabase...")
    df = load_from_supabase(sb)
    print(f"Current rows in Supabase: {len(df)}")

    today = date.today()

    if is_nba_api_data(df):
        print("Detected NBA API data — clearing Supabase and re-seeding from ESPN...")
        sb.table('nba_player_game_logs').delete().neq('player_id', 0).execute()
        df = pd.DataFrame()

    if df.empty:
        start = current_season_start()
        print(f"Fetching full season from {start.isoformat()} → {today.isoformat()}...")
    else:
        start = pd.to_datetime(df['game_date'].max()).date()
        print(f"Fetching from {start.isoformat()} → {today.isoformat()}...")

    rows = fetch_date_range(session, start, today)

    if not rows:
        print("No new games found.")
        return

    print(f"Upserting {len(rows)} rows to Supabase...")
    for i in range(0, len(rows), 500):
        sb.table('nba_player_game_logs').upsert(rows[i:i + 500]).execute()
        print(f"  {min(i + 500, len(rows))}/{len(rows)} done")

    print("Refresh complete.")


if __name__ == "__main__":
    run()
