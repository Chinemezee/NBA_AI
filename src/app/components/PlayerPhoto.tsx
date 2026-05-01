import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

type Props = {
  playerId: number;
  name: string;
  size?: 'sm' | 'lg';
  className?: string;
};

export function PlayerPhoto({ playerId, name, size = 'sm', className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [playerId]);

  const base = size === 'lg'
    ? 'size-20 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0 flex items-center justify-center'
    : 'size-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center';

  return (
    <div className={`${base} ${className}`}>
      {!failed ? (
        <img
          src={`https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png`}
          alt={name}
          className="w-full h-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <User className={size === 'lg' ? 'size-7 text-gray-600' : 'size-4 text-gray-500'} />
          {size === 'lg' && (
            <span className="text-[10px] text-gray-600 leading-none">Not Found</span>
          )}
        </div>
      )}
    </div>
  );
}
