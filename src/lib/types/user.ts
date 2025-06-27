import type { Theme, Accent } from './theme';

export type User = {
  id: string;
  bio: string | null;
  name: string;
  theme: Theme | null;
  accent: Accent | null;
  website: string | null;
  location: string | null;
  username: string;
  email: string;
  photo_url: string;
  verified: boolean;
  following: string[];
  followers: string[];
  created_at: string;
  updated_at: string | null;
  total_tweets: number;
  total_photos: number;
  pinned_tweet: string | null;
  cover_photo_url: string | null;
};

export type EditableData = Extract<
  keyof User,
  'bio' | 'name' | 'website' | 'photo_url' | 'location' | 'cover_photo_url'
>;

export type EditableUserData = Pick<User, EditableData>;