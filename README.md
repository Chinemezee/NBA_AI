
# NBA Betting Analysis UI

A full-stack NBA stats and prediction tool. The original UI design is available at https://www.figma.com/design/hPjKs85O2aM9ZPjLJYYiKj/NBA-Betting-Analysis-UI.

## Stack

- **Frontend:** React + Vite
- **Backend:** FastAPI (Python), hosted on Render
- **Database:** Supabase (PostgreSQL) — stores player game logs
- **AI:** Gemini 2.5 Flash for stat predictions

## Running locally

```bash
# Frontend
npm i
npm run dev

# Backend
pip install -r requirements.txt
uvicorn server:app --reload
```

## Environment variables (backend)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `GEMINI_API` | Gemini API key |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |

If `SUPABASE_URL` is not set, the backend falls back to `nba_player_game_logs.csv` for local development.

## Data refresh

Player game logs are updated daily at **9 AM UTC** via APScheduler running inside the FastAPI process.

- Fetches new games from the NBA API since the last known game date
- Upserts records into Supabase (no duplicates)
- Reloads the in-memory dataframe after each refresh

### Season handling

- The current season is derived automatically from today's date — no hardcoded season strings
- **Offseason (July–September):** the refresh job is skipped entirely
- **Season rollover (October):** old Supabase data is cleared and the new season starts fresh from October 1

### Keeping Render awake

Render's free tier spins down after 15 minutes of inactivity, which would kill the scheduler. A cron job on [cron-job.org](https://cron-job.org) pings the backend every **14 minutes** to keep it alive.

| Field | Value |
|---|---|
| URL | `https://nba-ai.onrender.com` |
| Method | GET |
| Schedule | Every 14 minutes |
