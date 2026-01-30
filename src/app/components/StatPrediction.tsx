import { Calendar, Trophy, TrendingUp } from 'lucide-react';
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
  // Prediction state - can be edited by user
  const [prediction, setPrediction] = useState({
    min: 35,
    fgPct: 0.52,
    fg3m: 3,
    fg3a: 7,
    fg3Pct: 0.43,
    pts: 28,
    ast: 8,
    reb: 9,
    stl: 1,
    blk: 1,
    oreb: 2,
    dreb: 7,
  });

  const [predictionReason, setPredictionReason] = useState(
    'Player has been consistent over the last 5 games with strong performance against similar opponents. Expecting continuation of current trend based on matchup favorability and recent form.'
  );

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-white mb-1">{player.name}</h2>
            <p className="text-gray-400">
              {player.team} • {player.position}
            </p>
          </div>
          <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="text-xs text-orange-400">Next Game</div>
            <div className="text-white">1/23 vs MIA</div>
          </div>
        </div>
      </div>

      {/* Recent Games Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg text-white">Recent Games</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-950">
              <tr>
                <th className="px-3 py-3 text-left text-xs text-gray-400 sticky left-0 bg-gray-950">GAME_DATE</th>
                <th className="px-3 py-3 text-left text-xs text-gray-400">MATCHUP</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">W/L</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">MIN</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">FG_PCT</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">FG3M</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">FG3A</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">FG3_PCT</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">PTS</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">AST</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">REB</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">STL</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">BLK</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">OREB</th>
                <th className="px-3 py-3 text-center text-xs text-gray-400">DREB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {player.recentGames.map((game, index) => (
                <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 py-3 text-white sticky left-0 bg-gray-900 hover:bg-gray-800/50">
                    {game.gameDate}
                  </td>
                  <td className="px-3 py-3 text-gray-300 whitespace-nowrap">{game.matchup}</td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        game.wl === 'W'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {game.wl}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-gray-300">{game.min}</td>
                  <td className="px-3 py-3 text-center text-gray-300">{(game.fgPct * 100).toFixed(1)}%</td>
                  <td className="px-3 py-3 text-center text-gray-300">{game.fg3m}</td>
                  <td className="px-3 py-3 text-center text-gray-300">{game.fg3a}</td>
                  <td className="px-3 py-3 text-center text-gray-300">{(game.fg3Pct * 100).toFixed(1)}%</td>
                  <td className="px-3 py-3 text-center text-white">{game.pts}</td>
                  <td className="px-3 py-3 text-center text-white">{game.ast}</td>
                  <td className="px-3 py-3 text-center text-white">{game.reb}</td>
                  <td className="px-3 py-3 text-center text-gray-300">{game.stl}</td>
                  <td className="px-3 py-3 text-center text-gray-300">{game.blk}</td>
                  <td className="px-3 py-3 text-center text-gray-300">{game.oreb}</td>
                  <td className="px-3 py-3 text-center text-gray-300">{game.dreb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Predicted Stats */}
      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <Trophy className="size-5 text-orange-500" />
          <h3 className="text-lg text-white">Predicted Stats for Next Game</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">MIN</div>
              <input
                type="number"
                value={prediction.min}
                onChange={(e) => setPrediction({ ...prediction, min: Number(e.target.value) })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">FG_PCT</div>
              <input
                type="number"
                step="0.01"
                value={(prediction.fgPct * 100).toFixed(1)}
                onChange={(e) => setPrediction({ ...prediction, fgPct: Number(e.target.value) / 100 })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
              <div className="text-xs text-gray-600">%</div>
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">FG3M</div>
              <input
                type="number"
                value={prediction.fg3m}
                onChange={(e) => setPrediction({ ...prediction, fg3m: Number(e.target.value) })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">FG3A</div>
              <input
                type="number"
                value={prediction.fg3a}
                onChange={(e) => setPrediction({ ...prediction, fg3a: Number(e.target.value) })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">FG3_PCT</div>
              <input
                type="number"
                step="0.01"
                value={(prediction.fg3Pct * 100).toFixed(1)}
                onChange={(e) => setPrediction({ ...prediction, fg3Pct: Number(e.target.value) / 100 })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
              <div className="text-xs text-gray-600">%</div>
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">PTS</div>
              <input
                type="number"
                value={prediction.pts}
                onChange={(e) => setPrediction({ ...prediction, pts: Number(e.target.value) })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">AST</div>
              <input
                type="number"
                value={prediction.ast}
                onChange={(e) => setPrediction({ ...prediction, ast: Number(e.target.value) })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">REB</div>
              <input
                type="number"
                value={prediction.reb}
                onChange={(e) => setPrediction({ ...prediction, reb: Number(e.target.value) })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">STL</div>
              <input
                type="number"
                value={prediction.stl}
                onChange={(e) => setPrediction({ ...prediction, stl: Number(e.target.value) })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">BLK</div>
              <input
                type="number"
                value={prediction.blk}
                onChange={(e) => setPrediction({ ...prediction, blk: Number(e.target.value) })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">OREB</div>
              <input
                type="number"
                value={prediction.oreb}
                onChange={(e) => setPrediction({ ...prediction, oreb: Number(e.target.value) })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
            </div>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">DREB</div>
              <input
                type="number"
                value={prediction.dreb}
                onChange={(e) => setPrediction({ ...prediction, dreb: Number(e.target.value) })}
                className="w-full bg-transparent text-xl text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Reasoning */}
      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <TrendingUp className="size-5 text-orange-500" />
          <h3 className="text-lg text-white">Reason for Prediction</h3>
        </div>
        <div className="p-6">
          <textarea
            value={predictionReason}
            onChange={(e) => setPredictionReason(e.target.value)}
            rows={4}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
            placeholder="Enter your reasoning for the prediction..."
          />
          <div className="mt-4 text-sm text-gray-400">
            Tip: Consider factors like recent form, matchup history, injury reports, and team dynamics
            when making predictions.
          </div>
        </div>
      </div>
    </div>
  );
}