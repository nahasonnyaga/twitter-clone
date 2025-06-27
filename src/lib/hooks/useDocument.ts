import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import type { User } from '@lib/types/user';

type UseDocument<T> = {
  data: T | null;
  loading: boolean;
};

type DataWithUser<T> = UseDocument<T & { user: User }>;

export function useDocument<T>(
  tableName: string,
  id: string,
  options: { includeUser: true; allowNull?: boolean; disabled?: boolean }
): DataWithUser<T>;

export function useDocument<T>(
  tableName: string,
  id: string,
  options?: { includeUser?: false; allowNull?: boolean; disabled?: boolean }
): UseDocument<T>;

export function useDocument<T>(
  tableName: string,
  id: string,
  options?: { includeUser?: boolean; allowNull?: boolean; disabled?: boolean }
): UseDocument<T> | DataWithUser<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const { includeUser, allowNull, disabled } = options ?? {};

  useEffect(() => {
    if (disabled || !id || id === 'null') {
      setData(null);
      setLoading(false);
      return;
    }

    setData(null);
    setLoading(true);

    const fetchData = async () => {
      try {
        const { data: result, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (allowNull) {
            setData(null);
            setLoading(false);
            return;
          }
          throw error;
        }

        if (includeUser && result) {
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', result.created_by)
            .single();
          
          setData({ ...result, user });
        } else {
          setData(result);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching document:', error);
        setData(null);
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`${tableName}_${id}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName, filter: `id=eq.${id}` },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, id, disabled, includeUser, allowNull]);

  return { data, loading };
}