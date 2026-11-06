import { useEffect, useState } from 'react';
import { Mic, Play, Shuffle, Timer } from 'lucide-react';
import GameFrame, { type GameProps } from '@/components/games/GameFrame';
import Button from '@/components/ui/Button';
import { drawSoundPrompt, SOUND_CHALLENGE_SECONDS } from '@/data/prompts';
import { INTENSITY_LABELS } from '@/types/game';

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function SoundChallengeGame({ state, onUpdate, onBack }: GameProps) {
  const { prompt, startedAt } = state.sound;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return;
    const startTime = Date.parse(startedAt);
    const durationMs = SOUND_CHALLENGE_SECONDS * 1000;
    setNow(Date.now());
    const interval = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current - startTime >= durationMs) window.clearInterval(interval);
    }, 250);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  const elapsedSeconds = startedAt ? (now - Date.parse(startedAt)) / 1000 : 0;
  const remaining = startedAt
    ? Math.min(SOUND_CHALLENGE_SECONDS, Math.max(0, Math.ceil(SOUND_CHALLENGE_SECONDS - elapsedSeconds)))
    : SOUND_CHALLENGE_SECONDS;
  const isRunning = startedAt !== null && remaining > 0;
  const isFinished = startedAt !== null && remaining === 0;
  const progress = remaining / SOUND_CHALLENGE_SECONDS;

  const drawNewPrompt = () =>
    onUpdate((current) => ({
      ...current,
      sound: { prompt: drawSoundPrompt(current.sound.prompt?.text), startedAt: null },
    }));

  const startTimer = () =>
    onUpdate((current) => ({
      ...current,
      sound: { ...current.sound, startedAt: new Date().toISOString() },
    }));

  return (
    <GameFrame
      icon={Mic}
      title="Sound Challenge"
      subtitle="A random sound, thirty seconds on the clock. Take turns performing."
      onBack={onBack}
    >
      <div className="grid items-stretch gap-8 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col rounded-3xl bg-white p-8 shadow-royal ring-1 ring-royal-100 sm:p-10">
          {prompt ? (
            <div key={prompt.text} className="flex flex-1 flex-col animate-pop-in">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-royal-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  {prompt.category}
                </span>
                <span className="rounded-full bg-royal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-royal-700 ring-1 ring-royal-100">
                  {INTENSITY_LABELS[prompt.intensity]}
                </span>
              </div>
              <p className="mt-8 flex-1 font-display text-3xl font-semibold leading-snug text-royal-900 sm:text-4xl">
                {prompt.text}
              </p>
              <p className="mt-6 text-sm leading-relaxed text-royal-800/70">
                Perform it with full commitment. Your partner rates the performance out of ten.
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-royal-50 text-royal-600">
                <Mic className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-5 font-display text-2xl font-semibold text-royal-900">Draw your first challenge</p>
              <p className="mt-2 max-w-sm text-royal-800/70">Both of you will see the same sound prompt.</p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3 border-t border-royal-100 pt-8">
            {prompt ? (
              <>
                <Button onClick={startTimer} disabled={isRunning} className="flex-1">
                  <Play className="h-4 w-4" aria-hidden />
                  {isFinished ? 'Go again' : 'Start 30 seconds'}
                </Button>
                <Button onClick={drawNewPrompt} variant="secondary" disabled={isRunning} className="flex-1">
                  <Shuffle className="h-4 w-4" aria-hidden />
                  New challenge
                </Button>
              </>
            ) : (
              <Button onClick={drawNewPrompt} className="w-full">
                <Shuffle className="h-4 w-4" aria-hidden />
                Draw a challenge
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl bg-royal-600 p-8 text-center text-white shadow-royal">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-100">Timer</p>
          <div className="relative mt-6 flex h-40 w-40 items-center justify-center">
            <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
              <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r={RING_RADIUS}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
                className="transition-[stroke-dashoffset] duration-300 ease-linear"
              />
            </svg>
            <span className="font-display text-5xl font-bold tabular-nums" aria-live="polite">
              {remaining}
            </span>
          </div>
          <p className="mt-6 flex items-center gap-2 font-medium">
            <Timer className="h-4 w-4" aria-hidden />
            {isRunning ? 'Go!' : isFinished ? "Time's up" : 'Ready'}
          </p>
        </div>
      </div>
    </GameFrame>
  );
}
