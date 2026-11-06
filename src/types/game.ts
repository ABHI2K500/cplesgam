import { DEFAULT_WHEEL_DARES } from '@/data/prompts';

export type GameId = 'hub' | 'truth' | 'wheel' | 'sound';

export type Intensity = 'flirty' | 'hot' | 'spicy';

export interface RoomPlayer {
  id: string;
  name: string;
}

export interface TruthDareCard {
  kind: 'truth' | 'dare';
  text: string;
}

export interface SoundPrompt {
  category: string;
  text: string;
  intensity: Intensity;
}

export interface RoomState {
  players: RoomPlayer[];
  activeGame: GameId;
  truthDare: {
    turnPlayerId: string | null;
    intensity: Intensity;
    card: TruthDareCard | null;
  };
  wheel: {
    dares: string[];
    spinId: number;
    resultIndex: number | null;
  };
  sound: {
    prompt: SoundPrompt | null;
    startedAt: string | null;
  };
}

export const INTENSITY_LABELS: Record<Intensity, string> = {
  flirty: 'Flirty',
  hot: 'Hot',
  spicy: 'Spicy',
};

export function createDefaultState(creator: RoomPlayer): RoomState {
  return {
    players: [creator],
    activeGame: 'hub',
    truthDare: { turnPlayerId: creator.id, intensity: 'flirty', card: null },
    wheel: { dares: [...DEFAULT_WHEEL_DARES], spinId: 0, resultIndex: null },
    sound: { prompt: null, startedAt: null },
  };
}

// Fills missing fields so a partially saved room never crashes the screens.
export function normalizeState(raw: unknown): RoomState | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Partial<RoomState>;
  return {
    players: Array.isArray(value.players) ? value.players : [],
    activeGame: value.activeGame ?? 'hub',
    truthDare: {
      turnPlayerId: value.truthDare?.turnPlayerId ?? null,
      intensity: value.truthDare?.intensity ?? 'flirty',
      card: value.truthDare?.card ?? null,
    },
    wheel: {
      dares: Array.isArray(value.wheel?.dares) ? value.wheel.dares : [...DEFAULT_WHEEL_DARES],
      spinId: value.wheel?.spinId ?? 0,
      resultIndex: value.wheel?.resultIndex ?? null,
    },
    sound: {
      prompt: value.sound?.prompt ?? null,
      startedAt: value.sound?.startedAt ?? null,
    },
  };
}
