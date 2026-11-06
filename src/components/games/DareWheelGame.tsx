import { useEffect, useRef, useState } from 'react';
import { Pencil, RotateCw } from 'lucide-react';
import EditDaresModal from '@/components/games/EditDaresModal';
import GameFrame, { type GameProps } from '@/components/games/GameFrame';
import Button from '@/components/ui/Button';
import { MIN_WHEEL_DARES } from '@/data/prompts';

const SPIN_DURATION_MS = 4500;
const FULL_TURNS = 6;
const WHEEL_RADIUS = 150;
const WHEEL_CENTER = 160;
const WHEEL_COLORS = ['#4169E1', '#A6BEF5', '#26439E'];

function pointOnWheel(angleDeg: number, radius: number) {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    x: WHEEL_CENTER + radius * Math.sin(radians),
    y: WHEEL_CENTER - radius * Math.cos(radians),
  };
}

function segmentColor(index: number, count: number) {
  if (count % 2 === 1 && index === count - 1) return WHEEL_COLORS[2];
  return index % 2 === 0 ? WHEEL_COLORS[0] : WHEEL_COLORS[1];
}

function labelColor(index: number, count: number) {
  return segmentColor(index, count) === WHEEL_COLORS[1] ? '#1C3278' : '#FFFFFF';
}

export default function DareWheelGame({ state, onUpdate, onBack }: GameProps) {
  const { dares, spinId, resultIndex } = state.wheel;
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [editing, setEditing] = useState(false);
  const lastSpinId = useRef(spinId);
  const spinTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(spinTimer.current), []);

  useEffect(() => {
    if (spinId === lastSpinId.current) return;
    lastSpinId.current = spinId;
    if (resultIndex === null || resultIndex >= dares.length) return;

    const segmentAngle = 360 / dares.length;
    const targetAngle = 360 - (resultIndex + 0.5) * segmentAngle;
    setRotation((previous) => {
      const current = ((previous % 360) + 360) % 360;
      const travel = (((targetAngle - current) % 360) + 360) % 360;
      return previous + FULL_TURNS * 360 + travel;
    });
    setSpinning(true);
    window.clearTimeout(spinTimer.current);
    spinTimer.current = window.setTimeout(() => setSpinning(false), SPIN_DURATION_MS);
  }, [spinId, resultIndex, dares]);

  const canSpin = dares.length >= MIN_WHEEL_DARES;
  const resultDare = !spinning && resultIndex !== null ? dares[resultIndex] : null;

  const spin = () => {
    if (spinning || !canSpin) return;
    const index = Math.floor(Math.random() * dares.length);
    void onUpdate((current) => ({
      ...current,
      wheel: { ...current.wheel, spinId: current.wheel.spinId + 1, resultIndex: index },
    }));
  };

  const saveDares = (nextDares: string[]) => {
    setEditing(false);
    void onUpdate((current) => ({
      ...current,
      wheel: { ...current.wheel, dares: nextDares, resultIndex: null },
    }));
  };

  return (
    <GameFrame
      icon={RotateCw}
      title="Spin the Wheel of Dares"
      subtitle="Whoever spins, you both see the same dare."
      onBack={onBack}
      actions={
        <Button variant="secondary" onClick={() => setEditing(true)} disabled={spinning}>
          <Pencil className="h-4 w-4" aria-hidden />
          Edit dares
        </Button>
      }
    >
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col items-center rounded-3xl bg-white p-8 shadow-royal ring-1 ring-royal-100 sm:p-10">
          <div className="relative h-[22rem] w-[22rem] max-w-full">
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-2" aria-hidden>
              <svg width="36" height="32" viewBox="0 0 36 32">
                <path d="M18 32 L2 4 Q18 -4 34 4 Z" fill="#FBBF24" stroke="#1C3278" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <svg
              viewBox="0 0 320 320"
              role="img"
              aria-label={`Wheel with ${dares.length} dares`}
              className="h-full w-full drop-shadow-xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
              }}
            >
              <circle cx={WHEEL_CENTER} cy={WHEEL_CENTER} r={WHEEL_RADIUS + 8} fill="#1C3278" />
              {dares.map((dare, index) => {
                const segmentAngle = 360 / dares.length;
                const start = index * segmentAngle;
                const end = (index + 1) * segmentAngle;
                const midpoint = start + segmentAngle / 2;
                const from = pointOnWheel(start, WHEEL_RADIUS);
                const to = pointOnWheel(end, WHEEL_RADIUS);
                const label = pointOnWheel(midpoint, WHEEL_RADIUS * 0.68);
                const largeArc = segmentAngle > 180 ? 1 : 0;
                return (
                  <g key={`${index}-${dare}`}>
                    <path
                      d={`M ${WHEEL_CENTER} ${WHEEL_CENTER} L ${from.x} ${from.y} A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArc} 1 ${to.x} ${to.y} Z`}
                      fill={segmentColor(index, dares.length)}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <text
                      x={label.x}
                      y={label.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={labelColor(index, dares.length)}
                      fontSize="20"
                      fontWeight="700"
                      fontFamily="Inter, sans-serif"
                    >
                      {index + 1}
                    </text>
                  </g>
                );
              })}
              <circle cx={WHEEL_CENTER} cy={WHEEL_CENTER} r="22" fill="#FFFFFF" stroke="#4169E1" strokeWidth="4" />
            </svg>
          </div>

          <Button onClick={spin} disabled={spinning || !canSpin} className="mt-10 w-full max-w-xs py-4 text-base">
            <RotateCw className={`h-5 w-5 ${spinning ? 'animate-spin' : ''}`} aria-hidden />
            {spinning ? 'Spinning...' : 'Spin the wheel'}
          </Button>
          {!canSpin && (
            <p className="mt-4 text-sm text-rose-700">Add at least {MIN_WHEEL_DARES} dares to spin.</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="min-h-[10rem] rounded-3xl bg-royal-600 p-8 text-white shadow-royal">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-100">Your dare</p>
            {spinning && <p className="mt-4 font-display text-2xl font-semibold">The wheel is spinning...</p>}
            {!spinning && resultDare && (
              <p key={`${spinId}-${resultIndex}`} className="mt-4 animate-pop-in font-display text-2xl font-semibold leading-snug">
                {resultDare}
              </p>
            )}
            {!spinning && !resultDare && (
              <p className="mt-4 text-royal-100">Spin the wheel to reveal the first dare.</p>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-royal-100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal-700/70">On the wheel</p>
            <ol className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {dares.map((dare, index) => (
                <li key={`${index}-${dare}`} className="flex gap-3 text-sm leading-relaxed text-royal-900">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-royal-100 text-xs font-semibold text-royal-800">
                    {index + 1}
                  </span>
                  <span>{dare}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {editing && <EditDaresModal dares={dares} onSave={saveDares} onClose={() => setEditing(false)} />}
    </GameFrame>
  );
}
