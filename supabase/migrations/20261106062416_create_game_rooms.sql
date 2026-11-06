/*
# Create game_rooms table for two-player couples games

1. New Tables
- `game_rooms`
  - `id` (uuid, primary key)
  - `code` (text, unique, 6 uppercase letters or digits) - the short code partners type to join
  - `state` (jsonb) - the shared game state both partners see (players, active game, cards, dares, timers)
  - `created_at` (timestamptz)

2. Realtime
- Adds `game_rooms` to the realtime publication so both partners receive live updates.

3. Security
- Enables RLS on `game_rooms`.
- No sign-in is used, so the anon and authenticated roles both get SELECT, INSERT and UPDATE.
- Deletion is not granted; rooms persist.
- Policies are scoped to these roles only.

4. Notes
- The room code is the access key: anyone with the code can join the room.
*/

CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9]{6}$'),
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON game_rooms TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_game_rooms" ON game_rooms;
CREATE POLICY "anon_select_game_rooms" ON game_rooms FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_game_rooms" ON game_rooms;
CREATE POLICY "anon_insert_game_rooms" ON game_rooms FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_game_rooms" ON game_rooms;
CREATE POLICY "anon_update_game_rooms" ON game_rooms FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'game_rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
  END IF;
END $$;
