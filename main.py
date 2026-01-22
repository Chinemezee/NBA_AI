from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.endpoints import playergamelog
from nba_api.live.nba.endpoints import scoreboard
import pandas as pd
import json
import os
from google import genai
from dotenv import load_dotenv
from pathlib import Path
from google.genai import types

nba_player_name = "Jalen Williams"
nba_players = players.find_players_by_full_name(f"{nba_player_name}")
player_id = nba_players[0]["id"]
print(f"{nba_player_name} id: {player_id}")

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

career = playercareerstats.PlayerCareerStats(player_id=player_id)   
df = career.get_data_frames()
print(df)    

gamelog = playergamelog.PlayerGameLog(player_id=player_id, season="2025-26")
df1 = gamelog.get_data_frames()[0]
print(df1)

games = scoreboard.ScoreBoard()
game_data = games.get_dict()
for game in game_data['scoreboard']['games']:
    print(f"{game['awayTeam']['teamName']} @ {game['homeTeam']['teamName']} - {game['gameStatusText']}")

print(career.get_data_frames['VS_TEAM_NAME'])
#if nba_player_name

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API"))

response = client.models.generate_content(
    model="gemini-3-flash-preview", 
    contents=[#f"write out the numbers in PTS column in {df1}"
              f"The numbers in PTS column in {df1} are the number of points made by nba player, {nba_player_name} from most recent game to the last"
              f"calculate the ppg and predict what the number of points in the next game would be"
              f"The numbers in AST column in {df1} are the number of assists made by nba player, {nba_player_name} from most recent game to the last"
              f"calculate the apg and predict what the number of assists in the next game would be"
              ],
    config=types.GenerateContentConfig(
        system_instruction="You are a professional NBA analyst ."     
    )     
)
print(response.text)