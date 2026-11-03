/*
# Create couples game rooms and state tables (no auth, single-tenant)

1. New Tables
- `game_rooms`
  - `id` (uuid, primary key)
  - `code` (text, 6-char uppercase room code, unique)
  - `player1_name` (text, not null)
  - `player2_name` (text, nullable — filled when partner joins)
  - `spice_level` (text, default 'medium' — mild/medium/hot)
  - `status` (text, default 'lobby' — lobby/playing/finished)
  - `current_turn` (text, nullable — 'player1' or 'player2')
  - `player1_score` (int, default 0)
  - `player2_score` (int, default 0)
  - `current_challenge` (jsonb, nullable — the active card/challenge)
  - `round` (int, default 1)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz, auto-updated)

- `used_cards`
  - `id` (uuid, primary key)
  - `room_id` (uuid, FK to game_rooms)
  - `card_id` (text — identifier of the card content)
  - `player_who_answered` (text — 'player1' or 'player2')
  - `completed` (boolean, default false)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on both tables.
- Grant CRUD to anon + authenticated (no-auth app, intentionally shared room data).
- Policies use USING (true) since the game rooms are accessed via room code — anyone with the code can play.

3. Notes
- No auth/login required — players join by room code.
- Real-time updates via Supabase subscriptions on game_rooms.
*/

CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  player1_name text NOT NULL,
  player2_name text,
  spice_level text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'lobby',
  current_turn text,
  player1_score int NOT NULL DEFAULT 0,
  player2_score int NOT NULL DEFAULT 0,
  current_challenge jsonb,
  round int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON game_rooms TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_rooms" ON game_rooms;
CREATE POLICY "anon_select_rooms" ON game_rooms FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_rooms" ON game_rooms;
CREATE POLICY "anon_insert_rooms" ON game_rooms FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_rooms" ON game_rooms;
CREATE POLICY "anon_update_rooms" ON game_rooms FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_rooms" ON game_rooms;
CREATE POLICY "anon_delete_rooms" ON game_rooms FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS used_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES game_rooms(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  player_who_answered text,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE used_cards ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON used_cards TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_used_cards" ON used_cards;
CREATE POLICY "anon_select_used_cards" ON used_cards FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_used_cards" ON used_cards;
CREATE POLICY "anon_insert_used_cards" ON used_cards FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_used_cards" ON used_cards;
CREATE POLICY "anon_update_used_cards" ON used_cards FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_used_cards" ON used_cards;
CREATE POLICY "anon_delete_used_cards" ON used_cards FOR DELETE
  TO anon, authenticated USING (true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS game_rooms_updated_at ON game_rooms;
CREATE TRIGGER game_rooms_updated_at BEFORE UPDATE ON game_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
