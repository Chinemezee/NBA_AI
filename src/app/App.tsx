import { useState, useEffect } from 'react';
import { PlayerStatsColumn } from '@/app/components/PlayerStatsColumn';
import { StatPrediction } from '@/app/components/StatPrediction';
import { TrendingUp, Search } from 'lucide-react';

export default function App() {
  // State for storing the real data from Python
  // We use 'any' here to keep it simple, but in a real app you'd define a Player interface
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('LeBron James');
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Function to call your Python Server
  const fetchPlayer = async (name: string) => {
    setLoading(true);
    try {
      // FIX: Encode the name to handle spaces safely
      // "LeBron James" becomes "LeBron%20James"
      const encodedName = encodeURIComponent(name); 
 
      // Fetch data using the encoded name
      const response = await fetch(`https://nba-ai.onrender.com/player/${encodedName}`);
      
      if (!response.ok) {
        throw new Error('Player not found');
      }

      const data = await response.json();
      
      // Update the UI with the real data
      setPlayers([data]); 
      setSelectedPlayer(data);
    } catch (error) {
      console.error("Failed to fetch player:", error);
      // Optional: You could set an error state here to show a message to the user
    }
    setLoading(false);
  };

  // 2. Load default player (LeBron) when the app starts
  useEffect(() => {
    fetchPlayer('LeBron James');
  }, []);

  // 3. Handle the Search (Enter Key)
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchPlayer(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-8 text-orange-500" />
            <h1 className="text-2xl text-white">NBA Betting Analysis</h1>
          </div>
          
          {/* Header Search Bar */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
            <div className="flex h-64 items-center justify-center">
                <div className="text-orange-500 text-xl animate-pulse">Loading live stats...</div>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player Stats Column */}
            <div className="lg:col-span-1">
                {selectedPlayer && (
                    <PlayerStatsColumn
                    players={players}
                    selectedPlayer={selectedPlayer}
                    onSelectPlayer={setSelectedPlayer}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    />
                )}
            </div>

            {/* Stat Prediction Area */}
            <div className="lg:col-span-2">
                {selectedPlayer && <StatPrediction player={selectedPlayer} />}
            </div>
            </div>
        )}
      </div>
    </div>
  );
}