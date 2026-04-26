import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

type NBATeam = {
  abbr: string;
  name: string;
  teamId: number;
  logoUrl: string;
};

type Props = {
  onSelectTeam: (abbr: string) => void;
};

export function TeamsGrid({ onSelectTeam }: Props) {
  const [teams, setTeams] = useState<NBATeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/teams`)
      .then(r => r.json())
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = teams.filter(
    t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.abbr.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="size-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-white font-semibold">All NBA Teams</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map(team => (
          <button
            key={team.abbr}
            onClick={() => onSelectTeam(team.abbr)}
            className="bg-gray-900 border border-gray-800 hover:border-orange-500/60 hover:bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-3 transition-all group"
          >
            <div className="size-16 flex items-center justify-center">
              <img
                src={team.logoUrl}
                alt={team.name}
                className="size-14 object-contain group-hover:scale-110 transition-transform duration-200"
                onError={e => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
            </div>
            <div className="text-center">
              <div className="text-white font-medium text-sm leading-tight">{team.name}</div>
              <div className="text-gray-500 text-xs mt-0.5">{team.abbr}</div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-500 py-16">
          No teams found for &ldquo;{search}&rdquo;
        </div>
      )}
    </div>
  );
}
