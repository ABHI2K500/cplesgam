import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { RoomPlayer, RoomState } from '@/types/game';

export interface GameProps {
  state: RoomState;
  me: RoomPlayer;
  partner: RoomPlayer;
  onUpdate: (change: (state: RoomState) => RoomState) => Promise<void>;
  onBack: () => void;
}

interface GameFrameProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  onBack: () => void;
  children: ReactNode;
}

export default function GameFrame({ icon: Icon, title, subtitle, actions, onBack, children }: GameFrameProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-10 animate-fade-up">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-royal-600 text-white shadow-lg shadow-royal-600/30">
            <Icon className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-3xl font-bold text-royal-900">{title}</h2>
            <p className="mt-1 text-royal-800/75">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All games
          </Button>
        </div>
      </div>
      {children}
    </section>
  );
}
