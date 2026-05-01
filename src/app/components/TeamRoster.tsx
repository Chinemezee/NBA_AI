import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import { PlayerPhoto } from './PlayerPhoto';

export type RosterPlayer = {
  id: number;
  name: string;
  number: string;
  position: string;
  height: string;
  weight: string;
};

type RosterData = {
  abbr: string;
  name: string;
  teamId: number;
  logoUrl: string;
  players: RosterPlayer[];
};

type Props = {
  abbr: string;
  onSelectPlayer: (player: RosterPlayer) => void;
  onBack: () => void;
  onPredict: () => void;
};

export function TeamRoster({ abbr, onSelectPlayer, onBack, onPredict }: Props) {
  const [roster, setRoster] = useState<RosterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setRoster(null);
    fetch(`${import.meta.env.VITE_API_URL}/team/${abbr}/roster`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load roster');
        return r.json();
      })
      .then(setRoster)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [abbr]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="size-8 text-orange-500 animate-spin" />
        <p className="text-gray-400 text-sm">Loading roster...</p>
      </div>
    );
  }

  if (error || !roster) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-red-400">{error || 'Failed to load roster'}</p>
        <button onClick={onBack} className="text-orange-500 hover:text-orange-400 text-sm underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      {/* Team header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Back to teams"
          >
            <ArrowLeft className="size-5" />
          </button>
          <img
            src={roster.logoUrl}
            alt={roster.name}
            className="size-14 object-contain"
            onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
          />
          <div>
            <h2 className="text-2xl text-white font-bold">{roster.name}</h2>
            <p className="text-gray-400 text-sm">{roster.players.length} players · click a player to view stats & prediction</p>
          </div>
        </div>
      </div>

      {/* Team Prediction CTA */}
      <button
        onClick={onPredict}
        className="w-full flex items-center justify-between bg-orange-500/10 border border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/20 rounded-xl p-4 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <TrendingUp className="size-5 text-orange-400" />
          </div>
          <div className="text-left">
            <div className="text-white font-semibold">Check Team Prediction</div>
            <div className="text-gray-400 text-sm">View recent stats & AI-powered prediction for next game</div>
          </div>
        </div>
        <ArrowLeft className="size-5 text-orange-400 rotate-180 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Player grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {roster.players.map(player => (
          <button
            key={player.id}
            onClick={() => onSelectPlayer(player)}
            className="bg-gray-900 border border-gray-800 hover:border-orange-500/50 hover:bg-gray-800 rounded-xl p-4 text-left transition-all group"
          >
            <div className="flex items-start gap-3">
              <PlayerPhoto playerId={player.id} name={player.name} size="sm" className="shrink-0" />
              <div className="min-w-0">
                <div className="text-white font-medium text-sm truncate">{player.name}</div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {player.number ? `#${player.number}` : '—'}
                  {player.position ? ` · ${player.position}` : ''}
                </div>
                {(player.height || player.weight) && (
                  <div className="text-gray-600 text-xs mt-0.5">
                    {[player.height, player.weight ? `${player.weight} lbs` : ''].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
