import { Flame, Mic, RotateCw, type LucideIcon } from 'lucide-react';
import type { GameId } from '@/types/game';

type PlayableGame = Exclude<GameId, 'hub'>;

interface GameOption {
  id: PlayableGame;
  title: string;
  description: string;
  tag: string;
  icon: LucideIcon;
  accent: string;
}

const GAME_OPTIONS: GameOption[] = [
  {
    id: 'truth',
    title: 'Hot & Spicy Truth or Dare',
    description: 'Take turns choosing a truth or a dare from three heat levels, from flirty to spicy.',
    tag: 'Adults only',
    icon: Flame,
    accent: 'from-royal-600 to-royal-800',
  },
  {
    id: 'wheel',
    title: 'Spin the Wheel of Dares',
    description: 'Spin a wheel that both of you can see. Edit the dares to make them personal.',
    tag: 'Customizable',
    icon: RotateCw,
    accent: 'from-royal-500 to-royal-700',
  },
  {
    id: 'sound',
    title: 'Sound Challenge',
    description: 'Draw a random sound to perform in 30 seconds. Your partner judges every moan and giggle.',
    tag: 'Adults only',
    icon: Mic,
    accent: 'from-royal-700 to-royal-950',
  },
];

interface GameMenuProps {
  onSelect: (game: PlayableGame) => void;
}

export default function GameMenu({ onSelect }: GameMenuProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12 animate-fade-up">
      <div className="mb-10 max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-royal-700">Pick a game</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Live for both players
          </span>
        </div>
        <h2 className="mt-3 font-display text-4xl font-bold text-royal-900">What should we play tonight?</h2>
        <p className="mt-4 text-lg leading-relaxed text-royal-800/80">
          Your choice appears on both screens. Either of you can start a game or switch to another.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {GAME_OPTIONS.map(({ id, title, description, tag, icon: Icon, accent }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className="group flex flex-col rounded-3xl bg-white p-7 text-left shadow-sm ring-1 ring-royal-100 transition duration-300 hover:-translate-y-1 hover:shadow-royal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal-300"
          >
            <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-md transition duration-300 group-hover:scale-105`}>
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <span className="mt-6 inline-flex w-fit rounded-full bg-royal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-royal-700 ring-1 ring-royal-100">
              {tag}
            </span>
            <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-royal-900">{title}</h3>
            <p className="mt-3 flex-1 leading-relaxed text-royal-800/75">{description}</p>
            <span className="mt-6 text-sm font-semibold text-royal-700 transition group-hover:text-royal-900">
              Play now &rarr;
            </span>
          </button>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-royal-800/60">
        Adults only · Keep it playful, check in often, and skip anything that does not feel right.
      </p>
    </section>
  );
}
