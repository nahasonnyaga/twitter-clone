/*
  # Create bookmarks table

  1. New Tables
    - `bookmarks`
      - `id` (uuid, primary key) - Bookmark's unique identifier
      - `user_id` (uuid) - ID of user who bookmarked
      - `tweet_id` (uuid) - ID of bookmarked tweet
      - `created_at` (timestamptz) - When bookmark was created

  2. Security
    - Enable RLS on `bookmarks` table
    - Add policy for users to read their own bookmarks
    - Add policy for users to create their own bookmarks
    - Add policy for users to delete their own bookmarks
*/

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tweet_id uuid NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tweet_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own bookmarks
CREATE POLICY "Users can read own bookmarks"
  ON bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to create their own bookmarks
CREATE POLICY "Users can create own bookmarks"
  ON bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_tweet_id_idx ON bookmarks(tweet_id);
CREATE INDEX IF NOT EXISTS bookmarks_created_at_idx ON bookmarks(created_at DESC);