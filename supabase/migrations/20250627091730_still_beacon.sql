/*
  # Create user_stats table

  1. New Tables
    - `user_stats`
      - `id` (uuid, primary key) - Stats record unique identifier
      - `user_id` (uuid) - ID of user these stats belong to
      - `likes` (text[]) - Array of tweet IDs the user has liked
      - `tweets` (text[]) - Array of tweet IDs the user has retweeted
      - `updated_at` (timestamptz, nullable) - When stats were last updated

  2. Security
    - Enable RLS on `user_stats` table
    - Add policy for users to read their own stats
    - Add policy for users to update their own stats
*/

CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  likes text[] NOT NULL DEFAULT '{}',
  tweets text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own stats
CREATE POLICY "Users can read own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own stats
CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own stats
CREATE POLICY "Users can insert own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS user_stats_user_id_idx ON user_stats(user_id);