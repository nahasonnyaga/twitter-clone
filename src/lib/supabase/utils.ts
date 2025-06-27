import { supabase } from './client';
import type { EditableUserData } from '@lib/types/user';
import type { FilesWithId, ImagesPreview } from '@lib/types/file';
import type { Theme, Accent } from '@lib/types/theme';

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .limit(1);
  
  return !data || data.length === 0;
}

export async function updateUserData(
  userId: string,
  userData: EditableUserData
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      ...userData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}

export async function updateUserTheme(
  userId: string,
  themeData: { theme?: Theme; accent?: Accent }
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update(themeData)
    .eq('id', userId);

  if (error) throw error;
}

export async function updateUsername(
  userId: string,
  username?: string
): Promise<void> {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };
  
  if (username) {
    updateData.username = username;
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId);

  if (error) throw error;
}

export async function managePinnedTweet(
  type: 'pin' | 'unpin',
  userId: string,
  tweetId: string
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      pinned_tweet: type === 'pin' ? tweetId : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}

export async function manageFollow(
  type: 'follow' | 'unfollow',
  userId: string,
  targetUserId: string
): Promise<void> {
  // Get current user data
  const { data: userData } = await supabase
    .from('users')
    .select('following')
    .eq('id', userId)
    .single();

  // Get target user data
  const { data: targetUserData } = await supabase
    .from('users')
    .select('followers')
    .eq('id', targetUserId)
    .single();

  if (!userData || !targetUserData) throw new Error('User not found');

  const newFollowing = type === 'follow' 
    ? [...userData.following, targetUserId]
    : userData.following.filter(id => id !== targetUserId);

  const newFollowers = type === 'follow'
    ? [...targetUserData.followers, userId]
    : targetUserData.followers.filter(id => id !== userId);

  // Update both users
  const { error: userError } = await supabase
    .from('users')
    .update({
      following: newFollowing,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (userError) throw userError;

  const { error: targetError } = await supabase
    .from('users')
    .update({
      followers: newFollowers,
      updated_at: new Date().toISOString()
    })
    .eq('id', targetUserId);

  if (targetError) throw targetError;
}

export async function removeTweet(tweetId: string): Promise<void> {
  const { error } = await supabase
    .from('tweets')
    .delete()
    .eq('id', tweetId);

  if (error) throw error;
}

export async function uploadImages(
  userId: string,
  files: FilesWithId
): Promise<ImagesPreview | null> {
  if (!files.length) return null;

  const imagesPreview = await Promise.all(
    files.map(async (file) => {
      const { id, name: alt, type } = file;
      const fileName = `${userId}/${id}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      return { id, src: data.publicUrl, alt, type };
    })
  );

  return imagesPreview;
}

export async function manageReply(
  type: 'increment' | 'decrement',
  tweetId: string
): Promise<void> {
  const { data: tweet } = await supabase
    .from('tweets')
    .select('user_replies')
    .eq('id', tweetId)
    .single();

  if (!tweet) return;

  const newReplies = type === 'increment' 
    ? tweet.user_replies + 1 
    : Math.max(0, tweet.user_replies - 1);

  const { error } = await supabase
    .from('tweets')
    .update({
      user_replies: newReplies,
      updated_at: new Date().toISOString()
    })
    .eq('id', tweetId);

  if (error) throw error;
}

export async function manageTotalTweets(
  type: 'increment' | 'decrement',
  userId: string
): Promise<void> {
  const { data: user } = await supabase
    .from('users')
    .select('total_tweets')
    .eq('id', userId)
    .single();

  if (!user) return;

  const newTotal = type === 'increment' 
    ? user.total_tweets + 1 
    : Math.max(0, user.total_tweets - 1);

  const { error } = await supabase
    .from('users')
    .update({
      total_tweets: newTotal,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}

export async function manageTotalPhotos(
  type: 'increment' | 'decrement',
  userId: string
): Promise<void> {
  const { data: user } = await supabase
    .from('users')
    .select('total_photos')
    .eq('id', userId)
    .single();

  if (!user) return;

  const newTotal = type === 'increment' 
    ? user.total_photos + 1 
    : Math.max(0, user.total_photos - 1);

  const { error } = await supabase
    .from('users')
    .update({
      total_photos: newTotal,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}

export function manageRetweet(
  type: 'retweet' | 'unretweet',
  userId: string,
  tweetId: string
) {
  return async (): Promise<void> => {
    // Get current tweet data
    const { data: tweet } = await supabase
      .from('tweets')
      .select('user_retweets')
      .eq('id', tweetId)
      .single();

    if (!tweet) throw new Error('Tweet not found');

    // Get current user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('tweets')
      .eq('user_id', userId)
      .single();

    if (!stats) throw new Error('User stats not found');

    const newRetweets = type === 'retweet'
      ? [...tweet.user_retweets, userId]
      : tweet.user_retweets.filter(id => id !== userId);

    const newStatsTweets = type === 'retweet'
      ? [...stats.tweets, tweetId]
      : stats.tweets.filter(id => id !== tweetId);

    // Update tweet
    const { error: tweetError } = await supabase
      .from('tweets')
      .update({
        user_retweets: newRetweets,
        updated_at: new Date().toISOString()
      })
      .eq('id', tweetId);

    if (tweetError) throw tweetError;

    // Update user stats
    const { error: statsError } = await supabase
      .from('user_stats')
      .update({
        tweets: newStatsTweets,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (statsError) throw statsError;
  };
}

export function manageLike(
  type: 'like' | 'unlike',
  userId: string,
  tweetId: string
) {
  return async (): Promise<void> => {
    // Get current tweet data
    const { data: tweet } = await supabase
      .from('tweets')
      .select('user_likes')
      .eq('id', tweetId)
      .single();

    if (!tweet) throw new Error('Tweet not found');

    // Get current user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('likes')
      .eq('user_id', userId)
      .single();

    if (!stats) throw new Error('User stats not found');

    const newLikes = type === 'like'
      ? [...tweet.user_likes, userId]
      : tweet.user_likes.filter(id => id !== userId);

    const newStatsLikes = type === 'like'
      ? [...stats.likes, tweetId]
      : stats.likes.filter(id => id !== tweetId);

    // Update tweet
    const { error: tweetError } = await supabase
      .from('tweets')
      .update({
        user_likes: newLikes,
        updated_at: new Date().toISOString()
      })
      .eq('id', tweetId);

    if (tweetError) throw tweetError;

    // Update user stats
    const { error: statsError } = await supabase
      .from('user_stats')
      .update({
        likes: newStatsLikes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (statsError) throw statsError;
  };
}

export async function manageBookmark(
  type: 'bookmark' | 'unbookmark',
  userId: string,
  tweetId: string
): Promise<void> {
  if (type === 'bookmark') {
    const { error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        tweet_id: tweetId
      });

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('tweet_id', tweetId);

    if (error) throw error;
  }
}

export async function clearAllBookmarks(userId: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}