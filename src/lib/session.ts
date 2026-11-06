import type { RoomPlayer } from '@/types/game';

const STORAGE_KEY = 'just-for-us-session';

function getSessionStorage(): Storage {
  return window.sessionStorage;
}

export interface StoredSession {
  player: RoomPlayer;
  roomId: string | null;
}

export function loadSession(): StoredSession | null {
  try {
    const raw = getSessionStorage().getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (!parsed.player?.id || !parsed.player.name) return null;
    return { player: parsed.player, roomId: parsed.roomId ?? null };
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession): void {
  getSessionStorage().setItem(STORAGE_KEY, JSON.stringify(session));
}

export function createPlayer(name: string, existingId?: string): RoomPlayer {
  return { id: existingId ?? crypto.randomUUID(), name: name.trim() };
}
