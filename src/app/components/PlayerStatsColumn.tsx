import { User, ChevronRight, Search } from 'lucide-react';

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

type PlayerStatsColumnProps = {
  players: Player[];
  selectedPlayer: Player;
  onSelectPlayer: (player: Player) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function PlayerStatsColumn({ 
  players, 
  selectedPlayer, 
  onSelectPlayer,
  searchQuery,
  onSearchChange 
}: PlayerStatsColumnProps) {
  // Calculate averages from recent games
  const calculateAverages = (player: Player) => {
    const games = player.recentGames;
    const pts = games.reduce((sum, g) => sum + g.pts, 0) / games.length;
    const reb = games.reduce((sum, g) => sum + g.reb, 0) / games.length;
    const ast = games.reduce((sum, g) => sum + g.ast, 0) / games.length;
    return { pts, reb, ast };
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg text-white mb-3">Players</h2>
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Player List */}
      <div className="divide-y divide-gray-800 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {players.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No players found
          </div>
        ) : (
          players.map((player) => {
            const averages = calculateAverages(player);
            return (
              <button
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className={`w-full p-4 text-left transition-colors hover:bg-gray-800 ${
                  selectedPlayer.id === player.id ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gray-800 flex items-center justify-center">
                      <User className="size-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-white">{player.name}</div>
                      <div className="text-sm text-gray-400">
                        {player.team} • {player.position}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-gray-600" />
                </div>

                {/* Season Averages */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-gray-950 rounded px-2 py-1">
                    <div className="text-xs text-gray-500">PTS</div>
                    <div className="text-white">{averages.pts.toFixed(1)}</div>
                  </div>
                  <div className="bg-gray-950 rounded px-2 py-1">
                    <div className="text-xs text-gray-500">REB</div>
                    <div className="text-white">{averages.reb.toFixed(1)}</div>
                  </div>
                  <div className="bg-gray-950 rounded px-2 py-1">
                    <div className="text-xs text-gray-500">AST</div>
                    <div className="text-white">{averages.ast.toFixed(1)}</div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}