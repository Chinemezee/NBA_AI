import pandas as pd
from nba_api.stats.endpoints import leaguegamelog


load_df = pd.read_csv("nba_player_game_logs.csv")
game_date = load_df["GAME_DATE"].max()

gamelog = leaguegamelog.LeagueGameLog(
    season="2025-26",
    player_or_team_abbreviation="P",
    date_from_nullable=game_date
)

df = gamelog.get_data_frames()[0]
df1 = df[['PLAYER_ID', 'GAME_ID', 'GAME_DATE', 'PLAYER_NAME','TEAM_ABBREVIATION','MATCHUP', 'WL','MIN','PTS', 'AST', 'REB', 'STL', 'BLK', 'OREB', 'DREB', 'FG_PCT', 'FG3M', 'FG3A', 'FG3_PCT', 'FTM','FTA']]

final_df = pd.concat([load_df, df1], ignore_index=True)

final_df = final_df.drop_duplicates(
    subset=["PLAYER_ID", "GAME_ID"],
    keep="last"
)

final_df.to_csv("nba_player_game_logs.csv", index=False)



#print(load_df.head(5))
