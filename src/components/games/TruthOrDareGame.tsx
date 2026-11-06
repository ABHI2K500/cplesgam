import { Flame, Heart, Sparkles } from 'lucide-react';
import GameFrame, { type GameProps } from '@/components/games/GameFrame';
import Button from '@/components/ui/Button';
import { drawTruthOrDare } from '@/data/prompts';
import { INTENSITY_LABELS, type Intensity, type TruthDareCard } from '@/types/game';

const HEAT_LEVELS: { level: Intensity; flames: number; description: string }[] = [
  { level: 'flirty', flames: 1, description: 'Playful and sweet' },
  { level: 'hot', flames: 2, description: 'Bold and steamy' },
  { level: 'spicy', flames: 3, description: 'Adults only, daring' },
];

export default function TruthOrDareGame({ state, me, partner, onUpdate, onBack }: GameProps) {
  const { truthDare, players } = state;
  const turnPlayer = players.find((player) => player.id === truthDare.turnPlayerId) ?? players[0];
  const isMyTurn = turnPlayer.id === me.id;
  const answerer = turnPlayer.id === me.id ? partner : me;
  const card = truthDare.card;

  const drawCard = (kind: TruthDareCard['kind']) =>
    onUpdate((current) => ({
      ...current,
      truthDare: {
        ...current.truthDare,
        card: drawTruthOrDare(kind, current.truthDare.intensity, current.truthDare.card?.text),
      },
    }));

  const setIntensity = (intensity: Intensity) =>
    onUpdate((current) => ({ ...current, truthDare: { ...current.truthDare, intensity } }));

  const passTurn = () =>
    onUpdate((current) => {
      const nextTurn = current.players.find((player) => player.id !== turnPlayer.id) ?? turnPlayer;
      return {
        ...current,
        truthDare: { ...current.truthDare, turnPlayerId: nextTurn.id, card: null },
      };
    });

  return (
    <GameFrame
      icon={Flame}
      title="Hot & Spicy Truth or Dare"
      subtitle="Pick a heat level, then let the card decide."
      onBack={onBack}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_1fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-royal-100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-700/70">Heat level</p>
            <div className="mt-4 space-y-2">
              {HEAT_LEVELS.map(({ level, flames, description }) => {
                const selected = truthDare.intensity === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setIntensity(level)}
                    aria-pressed={selected}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal-300 ${
                      selected
                        ? 'bg-royal-600 text-white shadow-md shadow-royal-600/25'
                        : 'bg-royal-50 text-royal-900 hover:bg-royal-100'
                    }`}
                  >
                    <span>
                      <span className="block font-semibold">{INTENSITY_LABELS[level]}</span>
                      <span className={`block text-xs ${selected ? 'text-royal-100' : 'text-royal-800/70'}`}>
                        {description}
                      </span>
                    </span>
                    <span className="flex gap-0.5" aria-label={`${flames} out of 3 heat`}>
                      {Array.from({ length: 3 }, (_, index) => (
                        <Flame
                          key={index}
                          className={`h-4 w-4 ${index < flames ? (selected ? 'fill-white text-white' : 'fill-royal-600 text-royal-600') : 'text-royal-200'}`}
                          aria-hidden
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-royal-600 p-6 text-white shadow-royal">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-100">Turn</p>
            <p className="mt-3 font-display text-2xl font-bold">
              {isMyTurn ? 'Your turn to pick' : `${turnPlayer.name} is picking`}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-royal-100">
              {turnPlayer.name} chooses truth or dare. {answerer.name} answers or performs it.
            </p>
          </div>
        </aside>

        <div className="flex flex-col rounded-3xl bg-white p-8 shadow-royal ring-1 ring-royal-100 sm:p-10">
          <div className="flex min-h-[16rem] flex-1 flex-col justify-center">
            {card ? (
              <div key={`${card.kind}-${card.text}`} className="animate-pop-in">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    card.kind === 'truth' ? 'bg-royal-100 text-royal-800' : 'bg-royal-800 text-white'
                  }`}
                >
                  {card.kind === 'truth' ? 'Truth' : 'Dare'}
                </span>
                <p className="mt-6 font-display text-3xl font-semibold leading-snug text-royal-900 sm:text-4xl">
                  {card.text}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-royal-50 text-royal-600">
                  <Heart className="h-6 w-6" aria-hidden />
                </span>
                <p className="mt-5 font-display text-2xl font-semibold text-royal-900">Ready when you are</p>
                <p className="mt-2 text-royal-800/70">
                  {isMyTurn ? 'Choose truth or dare to draw a card.' : `Waiting for ${turnPlayer.name} to draw a card.`}
                </p>
              </div>
            )}
          </div>

          {isMyTurn && (
            <div className="mt-10 flex flex-wrap gap-3 border-t border-royal-100 pt-8">
              <Button onClick={() => drawCard('truth')} variant="secondary" className="flex-1">
                <Sparkles className="h-4 w-4" aria-hidden />
                Truth
              </Button>
              <Button onClick={() => drawCard('dare')} className="flex-1">
                <Flame className="h-4 w-4" aria-hidden />
                Dare
              </Button>
              {card && (
                <Button onClick={passTurn} variant="ghost" className="w-full">
                  Done, pass the turn to {answerer.name}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </GameFrame>
  );
}
