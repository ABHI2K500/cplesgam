/*
# Fix update_updated_at function search path

1. Changes
- Recreate update_updated_at function with explicit search_path for security.
2. Security
- Resolves function_search_path_mutable advisor warning.
*/

DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS game_rooms_updated_at ON game_rooms;
CREATE TRIGGER game_rooms_updated_at BEFORE UPDATE ON game_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
