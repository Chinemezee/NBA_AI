import pandas as pd
import time
from nba_api.stats.endpoints import LeagueGameLog

load_df = pd.read_csv("nba_player_game_logs.csv")
game_date = load_df["GAME_DATE"].max()

max_retries = 3
df = None

for attempt in range(max_retries):
    try:
        print(f"Attempt {attempt + 1} to fetch NBA data starting from {game_date}...")

        time.sleep(1)  # polite delay to avoid rate limiting
        logs = LeagueGameLog(
            date_from_nullable=game_date,
            season='2025-26',
            player_or_team_abbreviation='P',
            timeout=60
        )
        df = logs.get_data_frames()[0]

        if df.empty:
            print("No new games found.")
            break

        print("Data successfully fetched and parsed!")
        break

    except Exception as e:
        print(f"Fetch failed: {e}")
        if attempt < max_retries - 1:
            print("Sleeping for 10 seconds before retrying...")
            time.sleep(10)
        else:
            print("Max retries reached.")
            raise e

if df is not None and not df.empty:
    print(f"Found {len(df)} recent games. Merging into database...")

    df1 = df[['PLAYER_ID', 'GAME_ID', 'GAME_DATE', 'PLAYER_NAME', 'TEAM_ABBREVIATION', 'MATCHUP', 'WL', 'MIN', 'PTS', 'AST', 'REB', 'STL', 'BLK', 'OREB', 'DREB', 'FG_PCT', 'FG3M', 'FG3A', 'FG3_PCT', 'FTM', 'FTA']]

    final_df = pd.concat([load_df, df1], ignore_index=True)

    final_df = final_df.drop_duplicates(
        subset=["PLAYER_ID", "GAME_ID"],
        keep="last"
    )

    final_df.to_csv("nba_player_game_logs.csv", index=False)
    print(f"Success! CSV updated. Total rows: {len(final_df)}")
else:
    print("No new games found to append.")
