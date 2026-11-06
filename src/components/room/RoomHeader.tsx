import { Heart, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { RoomPlayer } from '@/types/game';

interface RoomHeaderProps {
  code: string;
  players: RoomPlayer[];
  meId: string;
  onLeave: () => void;
}

export default function RoomHeader({ code, players, meId, onLeave }: RoomHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-royal-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-600 text-white shadow-md shadow-royal-600/30">
            <Heart className="h-5 w-5 fill-white" aria-hidden />
          </span>
          <span className="font-display text-xl font-bold text-royal-900">Just for Us</span>
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Live room
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {players.map((player) => (
            <span
              key={player.id}
              className="inline-flex items-center gap-2 rounded-full bg-royal-50 px-3 py-1.5 text-sm font-medium text-royal-900 ring-1 ring-royal-100"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              {player.name}
              {player.id === meId && <span className="text-xs text-royal-700/70">(you)</span>}
            </span>
          ))}
          <span className="rounded-full bg-royal-600 px-3 py-1.5 font-mono text-sm font-semibold tracking-widest text-white">
            {code}
          </span>
          <Button variant="ghost" onClick={onLeave} className="px-3 py-1.5 text-royal-700">
            <LogOut className="h-4 w-4" aria-hidden />
            Leave
          </Button>
        </div>
      </div>
    </header>
  );
}
