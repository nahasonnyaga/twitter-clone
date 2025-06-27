export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string
          id: string
          tweet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tweet_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tweet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_tweet_id_fkey"
            columns: ["tweet_id"]
            referencedRelation: "tweets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tweets: {
        Row: {
          created_at: string
          created_by: string
          id: string
          images: Json | null
          parent_id: string | null
          parent_username: string | null
          text: string | null
          updated_at: string | null
          user_likes: string[]
          user_replies: number
          user_retweets: string[]
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          images?: Json | null
          parent_id?: string | null
          parent_username?: string | null
          text?: string | null
          updated_at?: string | null
          user_likes?: string[]
          user_replies?: number
          user_retweets?: string[]
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          images?: Json | null
          parent_id?: string | null
          parent_username?: string | null
          text?: string | null
          updated_at?: string | null
          user_likes?: string[]
          user_replies?: number
          user_retweets?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "tweets_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_stats: {
        Row: {
          created_at: string
          id: string
          likes: string[]
          tweets: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          likes?: string[]
          tweets?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          likes?: string[]
          tweets?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          accent: string | null
          bio: string | null
          cover_photo_url: string | null
          created_at: string
          email: string
          followers: string[]
          following: string[]
          id: string
          location: string | null
          name: string
          photo_url: string
          pinned_tweet: string | null
          theme: string | null
          total_photos: number
          total_tweets: number
          updated_at: string | null
          username: string
          verified: boolean
          website: string | null
        }
        Insert: {
          accent?: string | null
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string
          email: string
          followers?: string[]
          following?: string[]
          id?: string
          location?: string | null
          name: string
          photo_url?: string
          pinned_tweet?: string | null
          theme?: string | null
          total_photos?: number
          total_tweets?: number
          updated_at?: string | null
          username: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          accent?: string | null
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string
          email?: string
          followers?: string[]
          following?: string[]
          id?: string
          location?: string | null
          name?: string
          photo_url?: string
          pinned_tweet?: string | null
          theme?: string | null
          total_photos?: number
          total_tweets?: number
          updated_at?: string | null
          username?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}