import type { ImagesPreview } from './file';
import type { User } from './user';

export type Tweet = {
  id: string;
  text: string | null;
  images: ImagesPreview | null;
  parent_id: string | null;
  parent_username: string | null;
  user_likes: string[];
  created_by: string;
  created_at: string;
  updated_at: string | null;
  user_replies: number;
  user_retweets: string[];
};

export type TweetWithUser = Tweet & { user: User };