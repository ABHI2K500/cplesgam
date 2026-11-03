import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export interface GameRoom {
  id: string;
  code: string;
  player1_name: string;
  player2_name: string | null;
  spice_level: 'mild' | 'medium' | 'hot';
  status: 'lobby' | 'playing' | 'finished';
  current_turn: 'player1' | 'player2' | null;
  player1_score: number;
  player2_score: number;
  current_challenge: Challenge | null;
  round: number;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  type: 'truth' | 'dare' | 'wyr' | 'act' | 'reveal';
  text: string;
  intensity: 1 | 2 | 3;
}

export type SpiceLevel = 'mild' | 'medium' | 'hot';

export type PlayerSlot = 'player1' | 'player2';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createRoom(playerName: string): Promise<GameRoom> {
  let code = generateCode();
  let attempts = 0;
  let success = false;
  let data: GameRoom | null = null;
  let error: unknown = null;

  while (!success && attempts < 5) {
    const result = await supabase
      .from('game_rooms')
      .insert({
        code,
        player1_name: playerName,
        spice_level: 'medium',
        status: 'lobby',
      })
      .select()
      .single();

    if (result.error) {
      attempts++;
      code = generateCode();
      error = result.error;
    } else {
      data = result.data as GameRoom;
      success = true;
    }
  }

  if (!success || !data) {
    throw new Error('Failed to create room. Please try again.');
  }
  return data;
}

export async function joinRoom(code: string, playerName: string): Promise<GameRoom> {
  const { data, error } = await supabase
    .from('game_rooms')
    .select()
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (error) throw new Error('Connection error. Please try again.');
  if (!data) throw new Error('Room not found. Check the code and try again.');
  if (data.player2_name) throw new Error('This room is already full.');
  if (data.status !== 'lobby') throw new Error('This game has already started.');

  const { data: updated, error: updateError } = await supabase
    .from('game_rooms')
    .update({ player2_name: playerName })
    .eq('id', (data as GameRoom).id)
    .select()
    .single();

  if (updateError || !updated) throw new Error('Failed to join room. Please try again.');
  return updated as GameRoom;
}

export async function getRoom(code: string): Promise<GameRoom | null> {
  const { data, error } = await supabase
    .from('game_rooms')
    .select()
    .eq('code', code.toUpperCase())
    .maybeSingle();
  if (error) return null;
  return data as GameRoom | null;
}

export async function startGame(roomId: string, spiceLevel: SpiceLevel, startingPlayer: PlayerSlot): Promise<void> {
  const { error } = await supabase
    .from('game_rooms')
    .update({ status: 'playing', spice_level: spiceLevel, current_turn: startingPlayer })
    .eq('id', roomId);
  if (error) throw new Error('Failed to start game.');
}

export async function updateRoom(roomId: string, updates: Partial<GameRoom>): Promise<void> {
  const { error } = await supabase.from('game_rooms').update(updates).eq('id', roomId);
  if (error) throw new Error('Failed to update game state.');
}

export async function clearUsedCards(roomId: string): Promise<void> {
  await supabase.from('used_cards').delete().eq('room_id', roomId);
}

export async function recordUsedCard(roomId: string, cardId: string, player: PlayerSlot, completed: boolean): Promise<void> {
  await supabase.from('used_cards').insert({
    room_id: roomId,
    card_id: cardId,
    player_who_answered: player,
    completed,
  });
}

export async function getUsedCardIds(roomId: string): Promise<string[]> {
  const { data } = await supabase.from('used_cards').select('card_id').eq('room_id', roomId);
  if (!data) return [];
  return data.map((row) => row.card_id as string);
}

export function subscribeToRoom(
  roomId: string,
  callback: (room: GameRoom) => void
): () => void {
  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
      (payload) => {
        callback(payload.new as GameRoom);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
