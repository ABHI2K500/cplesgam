import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { createDefaultState, normalizeState, type RoomPlayer, type RoomState } from '@/types/game';

export interface GameRoom {
  id: string;
  code: string;
  state: RoomState;
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_COLUMNS = 'id, code, state';
const LOCAL_ROOM_PREFIX = 'just-for-us-room:';
const LOCAL_ROOM_EVENT = 'just-for-us-room-updated';

function generateRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

function toGameRoom(row: { id: string; code: string; state: unknown }): GameRoom {
  const state = normalizeState(row.state);
  if (!state) throw new Error('This room could not be loaded.');
  return { id: row.id, code: row.code, state };
}

function localRoomKey(roomId: string) {
  return `${LOCAL_ROOM_PREFIX}${roomId}`;
}

function readLocalRoom(roomId: string): GameRoom | null {
  const raw = window.localStorage.getItem(localRoomKey(roomId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameRoom;
  } catch {
    return null;
  }
}

function writeLocalRoom(room: GameRoom) {
  window.localStorage.setItem(localRoomKey(room.id), JSON.stringify(room));
  window.dispatchEvent(new CustomEvent(LOCAL_ROOM_EVENT, { detail: room }));
}

export function subscribeToRoom(roomId: string, onChange: (room: GameRoom) => void) {
  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const channel = client
      .channel(`game-room-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const row = payload.new as { code: string; state: unknown };
          const state = normalizeState(row.state);
          if (state) onChange({ id: roomId, code: row.code, state });
        },
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === localRoomKey(roomId) && event.newValue) {
      const next = readLocalRoom(roomId);
      if (next) onChange(next);
    }
  };
  const handleCustomEvent = (event: Event) => {
    const room = (event as CustomEvent<GameRoom>).detail;
    if (room?.id === roomId) onChange(room);
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(LOCAL_ROOM_EVENT, handleCustomEvent);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(LOCAL_ROOM_EVENT, handleCustomEvent);
  };
}

export async function createRoom(player: RoomPlayer): Promise<GameRoom> {
  if (!isSupabaseConfigured || !supabase) {
    const room: GameRoom = { id: crypto.randomUUID(), code: generateRoomCode(), state: createDefaultState(player) };
    writeLocalRoom(room);
    return room;
  }
  const { data, error } = await supabase
    .from('game_rooms')
    .insert({ code: generateRoomCode(), state: createDefaultState(player) })
    .select(ROOM_COLUMNS)
    .maybeSingle();

  if (error || !data) throw new Error('We could not create a room. Please try again.');
  return toGameRoom(data);
}

export async function joinRoom(code: string, player: RoomPlayer): Promise<GameRoom> {
  const normalizedCode = code.trim().toUpperCase();
  if (!isSupabaseConfigured || !supabase) {
    const matchingRoom = Object.keys(window.localStorage)
      .filter((key) => key.startsWith(LOCAL_ROOM_PREFIX))
      .map((key) => readLocalRoom(key.slice(LOCAL_ROOM_PREFIX.length)))
      .find((room): room is GameRoom => room?.code === normalizedCode);
    if (!matchingRoom) throw new Error('No local room matches that code. Create a room in another tab first.');
    if (matchingRoom.state.players.some((existing) => existing.id === player.id)) return matchingRoom;
    if (matchingRoom.state.players.length >= 2) throw new Error('That room already has two players.');
    const nextState: RoomState = {
      ...matchingRoom.state,
      players: [...matchingRoom.state.players, player],
    };
    const nextRoom = { ...matchingRoom, state: nextState };
    writeLocalRoom(nextRoom);
    return nextRoom;
  }
  const { data, error } = await supabase
    .from('game_rooms')
    .select(ROOM_COLUMNS)
    .eq('code', normalizedCode)
    .maybeSingle();

  if (error) throw new Error('We could not reach the room. Check your connection and try again.');
  if (!data) throw new Error('No room matches that code.');

  const room = toGameRoom(data);
  if (room.state.players.some((existing) => existing.id === player.id)) return room;
  if (room.state.players.length >= 2) throw new Error('That room already has two players.');

  const nextState: RoomState = {
    ...room.state,
    players: [...room.state.players, player],
    truthDare: {
      ...room.state.truthDare,
      turnPlayerId: room.state.truthDare.turnPlayerId ?? player.id,
    },
  };
  await saveRoomState(room.id, nextState);
  return { ...room, state: nextState };
}

export async function fetchRoom(roomId: string): Promise<GameRoom | null> {
  if (!isSupabaseConfigured || !supabase) return readLocalRoom(roomId);
  const { data, error } = await supabase
    .from('game_rooms')
    .select(ROOM_COLUMNS)
    .eq('id', roomId)
    .maybeSingle();

  if (error) throw new Error('We could not load the room.');
  return data ? toGameRoom(data) : null;
}

export async function saveRoomState(roomId: string, state: RoomState): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const room = readLocalRoom(roomId);
    if (!room) throw new Error('This room is no longer available.');
    writeLocalRoom({ ...room, state });
    return;
  }
  const { error } = await supabase.from('game_rooms').update({ state }).eq('id', roomId);
  if (error) throw new Error('Your last action did not save. Please try again.');
}
