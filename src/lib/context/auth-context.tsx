import { useState, useEffect, useContext, createContext, useMemo } from 'react';
import { supabase } from '@lib/supabase/client';
import { getRandomId, getRandomInt } from '@lib/random';
import { checkUsernameAvailability } from '@lib/supabase/utils';
import type { ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@lib/types/user';
import type { Bookmark } from '@lib/types/bookmark';
import type { Stats } from '@lib/types/stats';

type AuthContext = {
  user: User | null;
  error: Error | null;
  loading: boolean;
  isAdmin: boolean;
  randomSeed: string;
  userBookmarks: Bookmark[] | null;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

export const AuthContext = createContext<AuthContext | null>(null);

type AuthContextProviderProps = {
  children: ReactNode;
};

export function AuthContextProvider({
  children
}: AuthContextProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [userBookmarks, setUserBookmarks] = useState<Bookmark[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleUser(session.user);
      } else {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserBookmarks(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleUser = async (authUser: SupabaseUser): Promise<void> => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!existingUser) {
        // Create new user
        let available = false;
        let randomUsername = '';

        while (!available) {
          const normalizeName = authUser.user_metadata?.full_name?.replace(/\s/g, '').toLowerCase() || 'user';
          const randomInt = getRandomInt(1, 10_000);
          randomUsername = `${normalizeName}${randomInt}`;

          const isUsernameAvailable = await checkUsernameAvailability(randomUsername);
          if (isUsernameAvailable) available = true;
        }

        const newUser = {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.full_name || 'User',
          username: randomUsername,
          photo_url: authUser.user_metadata?.avatar_url || '/assets/twitter-avatar.jpg'
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert(newUser);

        if (insertError) throw insertError;

        // Create user stats
        const { error: statsError } = await supabase
          .from('user_stats')
          .insert({ user_id: authUser.id });

        if (statsError) throw statsError;

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        setUser(userData);
      } else {
        setUser(existingUser);
      }

      // Load bookmarks
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      setUserBookmarks(bookmarks || []);
      setLoading(false);
    } catch (error) {
      setError(error as Error);
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      });
      if (error) throw error;
    } catch (error) {
      setError(error as Error);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setError(error as Error);
    }
  };

  const isAdmin = user ? user.username === 'ccrsxx' : false;
  const randomSeed = useMemo(getRandomId, [user?.id]);

  const value: AuthContext = {
    user,
    error,
    loading,
    isAdmin,
    randomSeed,
    userBookmarks,
    signOut,
    signInWithGoogle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContext {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error('useAuth must be used within an AuthContextProvider');

  return context;
}