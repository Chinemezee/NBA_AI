import { Trophy, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';

type Player = {
  id: number;
  name: string;
  team: string;
  position: string;
  recentGames: Array<{
    gameDate: string;
    matchup: string;
    wl: string;
    min: number;
    fgPct: number;
    fg3m: number;
    fg3a: number;
    fg3Pct: number;
    pts: number;
    ast: number;
    reb: number;
    stl: number;
    blk: number;
    oreb: number;
    dreb: number;
  }>;
};

type StatPredictionProps = {
  player: Player;
};

export function StatPrediction({ player }: StatPredictionProps) {
  const [loading, setLoading] = useState(false);
  
  // Prediction state initialized with 0s until AI runs
  const [prediction, setPrediction] = useState({
    pts: 0,
    ast: 0,
    reb: 0,
    fg3m: 0,
  });

  const [predictionReason, setPredictionReason] = useState(
    'Click "Generate AI Prediction" to analyze recent games and predict the next performance.'
  );

  const generatePrediction = async () => {
    setLoading(true);
    try {
      // 1. Prepare the payload matching your server.py "PredictionRequest" class
      const payload = {
        player_name: player.name,
        stats: player.recentGames // Sending the full history for AI context
      };

      // 2. Call your backend
      const response = await fetch('https://nba-ai.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prediction');
      }

      // 3. Parse the result from Gemini
      // Expected format: { pts: number, ast: number, reb: number, fg3m: number, prediction_reasoning: string }
      const data = await response.json();
      
      // Handle case where Gemini returns stringified JSON (sometimes happens)
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

      // 4. Update State
      setPrediction({
        pts: parsedData.pts || 0,
        ast: parsedData.ast || 0,
        reb: parsedData.reb || 0,
        fg3m: parsedData.fg3m || 0,
      });
      setPredictionReason(parsedData.prediction_reasoning || "No reasoning provided.");

    } catch (error) {
      console.error("Prediction Error:", error);
      setPredictionReason("Failed to generate prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Button */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-orange-500" />
          <h3 className="text-lg text-white">AI Stat Prediction</h3>
        </div>
        
        <button
          onClick={generatePrediction}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Generate Prediction
            </>
          )}
        </button>
      </div>

      {/* Prediction Cards (Filtered to only PTS, AST, REB, FG3M) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* POINTS */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Points</div>
            <input
            type="number"
            value={prediction.pts}
            onChange={(e) => setPrediction({ ...prediction, pts: Number(e.target.value) })}
            className="w-full bg-transparent text-3xl font-bold text-white focus:outline-none"
            />
        </div>

        {/* ASSISTS */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Assists</div>
            <input
            type="number"
            value={prediction.ast}
            onChange={(e) => setPrediction({ ...prediction, ast: Number(e.target.value) })}
            className="w-full bg-transparent text-3xl font-bold text-white focus:outline-none"
            />
        </div>

        {/* REBOUNDS */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Rebounds</div>
            <input
            type="number"
            value={prediction.reb}
            onChange={(e) => setPrediction({ ...prediction, reb: Number(e.target.value) })}
            className="w-full bg-transparent text-3xl font-bold text-white focus:outline-none"
            />
        </div>

        {/* 3-POINTERS */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">3-Pointers</div>
            <input
            type="number"
            value={prediction.fg3m}
            onChange={(e) => setPrediction({ ...prediction, fg3m: Number(e.target.value) })}
            className="w-full bg-transparent text-3xl font-bold text-white focus:outline-none"
            />
        </div>
      </div>

      {/* Prediction Reasoning */}
      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <TrendingUp className="size-5 text-orange-500" />
          <h3 className="text-lg text-white">AI Analysis</h3>
        </div>
        <div className="p-6">
          <textarea
            value={predictionReason}
            readOnly // Make it read-only so users don't think they should edit the AI text
            rows={4}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-4 text-gray-300 focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}