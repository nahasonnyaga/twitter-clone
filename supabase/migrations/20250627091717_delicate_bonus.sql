/*
  # Create tweets table

  1. New Tables
    - `tweets`
      - `id` (uuid, primary key) - Tweet's unique identifier
      - `text` (text, nullable) - Tweet content
      - `images` (jsonb, nullable) - Array of image data
      - `parent_id` (text, nullable) - ID of parent tweet (for replies)
      - `parent_username` (text, nullable) - Username of parent tweet author
      - `user_likes` (text[]) - Array of user IDs who liked this tweet
      - `user_retweets` (text[]) - Array of user IDs who retweeted this tweet
      - `user_replies` (integer) - Number of replies
      - `created_by` (uuid) - ID of user who created the tweet
      - `created_at` (timestamptz) - When tweet was created
      - `updated_at` (timestamptz, nullable) - When tweet was last updated

  2. Security
    - Enable RLS on `tweets` table
    - Add policy for authenticated users to read tweets
    - Add policy for users to create their own tweets
    - Add policy for users to update their own tweets
    - Add policy for users to delete their own tweets
*/

CREATE TABLE IF NOT EXISTS tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text,
  images jsonb,
  parent_id text,
  parent_username text,
  user_likes text[] NOT NULL DEFAULT '{}',
  user_retweets text[] NOT NULL DEFAULT '{}',
  user_replies integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all tweets
CREATE POLICY "Authenticated users can read tweets"
  ON tweets
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to create tweets
CREATE POLICY "Users can create tweets"
  ON tweets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own tweets
CREATE POLICY "Users can update own tweets"
  ON tweets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Allow users to delete their own tweets
CREATE POLICY "Users can delete own tweets"
  ON tweets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tweets_created_by_idx ON tweets(created_by);
CREATE INDEX IF NOT EXISTS tweets_created_at_idx ON tweets(created_at DESC);
CREATE INDEX IF NOT EXISTS tweets_parent_id_idx ON tweets(parent_id);
CREATE INDEX IF NOT EXISTS tweets_user_likes_idx ON tweets USING GIN(user_likes);
CREATE INDEX IF NOT EXISTS tweets_user_retweets_idx ON tweets USING GIN(user_retweets);