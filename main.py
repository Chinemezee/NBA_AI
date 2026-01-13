from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.endpoints import playergamelog
import pandas as pd
import json
import os
import time

nba_players = players.find_players_by_last_name("Harden")
player_id = nba_players[0]["id"]
print(player_id)

file_path = "player_id.json"
if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        try:
            data = json.load(file)
        except json.JSONDecodeError:
            data = []
else: 
    data = []
data.append(nba_players)
with open(file_path, "w", encoding="utf-8") as file:
    json.dump(data, file, indent=4)  

'''career = playercareerstats.PlayerCareerStats(player_id=player_id)   
df = career.get_data_frames()
print(df) '''   

gamelog = playergamelog.PlayerGameLog(player_id=player_id, season="2025-26")
df1 = gamelog.get_data_frames()[0]["PTS"]
print(df1)