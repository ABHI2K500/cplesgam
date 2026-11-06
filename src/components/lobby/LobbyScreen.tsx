import { useState, type FormEvent } from 'react';
import { ArrowRight, Flame, Heart, Loader2, Mic, RotateCw } from 'lucide-react';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import { createRoom, joinRoom } from '@/lib/rooms';
import { createPlayer } from '@/lib/session';
import type { RoomPlayer } from '@/types/game';

type LobbyMode = 'create' | 'join';

const GAME_PREVIEWS = [
  { icon: Flame, title: 'Hot & Spicy Truth or Dare', detail: 'Three heat levels, one card at a time' },
  { icon: RotateCw, title: 'Spin the Wheel of Dares', detail: 'Write your own dares for the wheel' },
  { icon: Mic, title: 'Sound Challenge', detail: 'Random 30-second performances' },
];

interface LobbyScreenProps {
  existingPlayer: RoomPlayer | null;
  onEnterRoom: (player: RoomPlayer, roomId: string) => void;
}

export default function LobbyScreen({ existingPlayer, onEnterRoom }: LobbyScreenProps) {
  const [mode, setMode] = useState<LobbyMode>('create');
  const [name, setName] = useState(existingPlayer?.name ?? '');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter your name to continue.');
      return;
    }
    if (mode === 'join' && code.trim().length !== 6) {
      setError('Room codes are 6 characters long.');
      return;
    }

    const player = createPlayer(trimmedName, existingPlayer?.id);
    setSubmitting(true);
    setError(null);
    try {
      const room = mode === 'create' ? await createRoom(player) : await joinRoom(code, player);
      onEnterRoom(player, room.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <main className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:px-10">
        <section className="animate-fade-up space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-royal-700 shadow-sm ring-1 ring-royal-100">
            <Heart className="h-4 w-4 fill-royal-600 text-royal-600" aria-hidden />
            Games for two, played together
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-5xl font-bold leading-tight text-royal-900 sm:text-6xl">
              Just for Us
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-royal-800/80">
              Start a room, share the code, and play in real time with your partner. Every card, spin and
              challenge appears on both screens at once.
            </p>
          </div>
          <ul className="space-y-3">
            {GAME_PREVIEWS.map(({ icon: Icon, title, detail }) => (
              <li
                key={title}
                className="flex items-center gap-4 rounded-2xl bg-white/70 p-4 ring-1 ring-royal-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-royal-600 text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-royal-900">{title}</span>
                  <span className="block text-sm text-royal-800/70">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-royal-800/60">
            Adults only. Every challenge is optional, so play only with consent and respect each other's limits.
            {!import.meta.env.VITE_SUPABASE_URL && ' Local mode is active: open this app in two browser tabs to play.'}
          </p>
        </section>

        <section className="animate-fade-up rounded-3xl bg-white p-8 shadow-royal ring-1 ring-royal-100 [animation-delay:120ms] sm:p-10">
          <div className="mb-8 grid grid-cols-2 rounded-full bg-royal-50 p-1 ring-1 ring-royal-100">
            {(['create', 'join'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMode(option);
                  setError(null);
                }}
                aria-pressed={mode === option}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal-300 ${
                  mode === option ? 'bg-royal-600 text-white shadow-md' : 'text-royal-700 hover:text-royal-900'
                }`}
              >
                {option === 'create' ? 'Start a room' : 'Join with code'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label htmlFor="player-name" className="text-sm font-medium text-royal-900">
                Your name
              </label>
              <input
                id="player-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={20}
                placeholder="How should your partner see you?"
                autoComplete="given-name"
                className="w-full rounded-2xl border border-royal-200 bg-royal-50/50 px-4 py-3.5 text-royal-950 placeholder:text-royal-800/40 transition focus:border-royal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-royal-100"
              />
            </div>

            {mode === 'join' && (
              <div className="space-y-2">
                <label htmlFor="room-code" className="text-sm font-medium text-royal-900">
                  Room code
                </label>
                <input
                  id="room-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  maxLength={6}
                  placeholder="ABC123"
                  className="w-full rounded-2xl border border-royal-200 bg-royal-50/50 px-4 py-3.5 text-center font-display text-2xl font-semibold tracking-[0.4em] text-royal-950 placeholder:tracking-normal placeholder:text-royal-800/40 transition focus:border-royal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-royal-100"
                />
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="w-full py-4 text-base">
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <>
                  {mode === 'create' ? 'Create my room' : 'Join room'}
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </>
              )}
            </Button>
          </form>
        </section>
      </main>
    </AppShell>
  );
}
