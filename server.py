from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from nba_api.stats.static import players
from nba_api.stats.endpoints import playergamelog
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import pandas as pd
import requests
from nba_api.stats.library.http import NBAStatsHTTP


os.environ['CURL_CA_BUNDLE'] = ""
# 1. Initialize the App (This is the "app" variable uvicorn is looking for!)
app = FastAPI()

# 2. Allow your React App to talk to this Server (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://nba-analytics-blond.vercel.app"], # Your React App URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
SCRAPER_API_KEY = 'b932c8580723c23b15c9a192d7ee104e'
proxy_url = f"http://scraperapi:{SCRAPER_API_KEY}@proxy-server.scraperapi.com:8001"
# NBA API usually requires these specific headers to avoid timeouts/blocks
custom_headers = {
    'Host': 'stats.nba.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Connection': 'keep-alive',
}
# Create session
session = requests.Session()

# Attach proxy
session.proxies = {
    "http": proxy_url,
    "https": proxy_url
}

# Attach required NBA headers
session.headers.update(custom_headers)

# Inject session into nba_api
NBAStatsHTTP._session = session


# Load environment variables
load_dotenv()
# Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API"))

# 3. Define the Data Structure for Requests
class PredictionRequest(BaseModel):
    player_name: str
    stats: list 

@app.get("/player/{name}")
def get_player_stats(name: str):
    """
    Finds a player and returns their recent game stats.
    """
    try:
        # Search for player
        nba_players = players.find_players_by_full_name(name)
        if not nba_players:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player_id = nba_players[0]["id"]
        
        # Get Game Log
        gamelog = playergamelog.PlayerGameLog(player_id=player_id,
                                              season="2025-26",
                                              timeout = 60)
        df = gamelog.get_data_frames()[0]
        
        # Clean up data for the frontend
        recent_games = []
        for index, row in df.head(10).iterrows():
            recent_games.append({
                "gameDate": row['GAME_DATE'],
                "matchup": row['MATCHUP'],
                "wl": row['WL'],
                "min": int(float(row['MIN'])),
                "pts": int(row['PTS']),
                "ast": int(row['AST']),
                "reb": int(row['REB']),
                "fgPct": float(row['FG_PCT']),
                "fg3m": int(row['FG3M']),
                "fg3a": int(row['FG3A']),
                "fg3Pct": float(row['FG3_PCT']),
                "stl": int(row['STL']),
                "blk": int(row['BLK']),
                "oreb": int(row['OREB']),
                "dreb": int(row['DREB'])
            })
            
        return {
            "id": player_id,
            "name": nba_players[0]["full_name"],
            "team": "NBA",
            "position": "Player",
            "recentGames": recent_games
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
def predict_performance(request: PredictionRequest):
    """
    Sends the stats to Gemini to predict the next game.
    """
    # Create a prompt string from the stats
    stats_text = str(request.stats)
    
    prompt = f"""
    You are an expert NBA betting analyst. 
    Here are the recent stats for {request.player_name}: {stats_text}
    
    Based on this trend, predict their stats for the next game.
    Return ONLY a JSON object with these keys: pts, ast, reb, fg3m prediction_reasoning.
    Do not use markdown formatting.
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    return response.text

#uvicorn server:app --reload