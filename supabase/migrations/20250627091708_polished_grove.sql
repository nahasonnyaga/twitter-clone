/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User's unique identifier
      - `email` (text, unique) - User's email address
      - `name` (text) - User's display name
      - `username` (text, unique) - User's unique username
      - `bio` (text, nullable) - User's biography
      - `website` (text, nullable) - User's website URL
      - `location` (text, nullable) - User's location
      - `photo_url` (text) - User's profile photo URL
      - `cover_photo_url` (text, nullable) - User's cover photo URL
      - `verified` (boolean) - Whether user is verified
      - `theme` (text, nullable) - User's preferred theme
      - `accent` (text, nullable) - User's preferred accent color
      - `following` (text[]) - Array of user IDs this user follows
      - `followers` (text[]) - Array of user IDs that follow this user
      - `total_tweets` (integer) - Total number of tweets
      - `total_photos` (integer) - Total number of photos
      - `pinned_tweet` (text, nullable) - ID of pinned tweet
      - `created_at` (timestamptz) - When user was created
      - `updated_at` (timestamptz, nullable) - When user was last updated

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read all user data
    - Add policy for users to update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  username text UNIQUE NOT NULL,
  bio text,
  website text,
  location text,
  photo_url text NOT NULL DEFAULT '/assets/twitter-avatar.jpg',
  cover_photo_url text,
  verified boolean NOT NULL DEFAULT false,
  theme text CHECK (theme IN ('light', 'dim', 'dark')),
  accent text CHECK (accent IN ('blue', 'yellow', 'pink', 'purple', 'orange', 'green')),
  following text[] NOT NULL DEFAULT '{}',
  followers text[] NOT NULL DEFAULT '{}',
  total_tweets integer NOT NULL DEFAULT 0,
  total_photos integer NOT NULL DEFAULT 0,
  pinned_tweet text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read all user profiles
CREATE POLICY "Users can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);