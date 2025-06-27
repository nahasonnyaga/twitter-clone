import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import type { User } from '@lib/types/user';

type UseCollection<T> = {
  data: T[] | null;
  loading: boolean;
};

type DataWithUser<T> = UseCollection<T & { user: User }>;

export type UseCollectionOptions = {
  includeUser?: boolean;
  allowNull?: boolean;
  disabled?: boolean;
  preserve?: boolean;
};

export function useCollection<T>(
  tableName: string,
  query?: any,
  options: {
    includeUser: true;
    allowNull?: boolean;
    disabled?: boolean;
    preserve?: boolean;
  }
): DataWithUser<T>;

export function useCollection<T>(
  tableName: string,
  query?: any,
  options?: UseCollectionOptions
): UseCollection<T>;

export function useCollection<T>(
  tableName: string,
  query?: any,
  options?: UseCollectionOptions
): UseCollection<T> | DataWithUser<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  const { includeUser, allowNull, disabled, preserve } = options ?? {};

  useEffect(() => {
    if (disabled) {
      setLoading(false);
      return;
    }

    if (!preserve && data) {
      setData(null);
      setLoading(true);
    }

    const fetchData = async () => {
      try {
        let queryBuilder = supabase.from(tableName).select('*');
        
        if (query) {
          queryBuilder = query(queryBuilder);
        }

        const { data: result, error } = await queryBuilder;

        if (error) throw error;

        if (allowNull && (!result || result.length === 0)) {
          setData(null);
          setLoading(false);
          return;
        }

        if (includeUser && result) {
          const dataWithUser = await Promise.all(
            result.map(async (item: any) => {
              const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', item.created_by)
                .single();
              
              return { ...item, user };
            })
          );
          setData(dataWithUser);
        } else {
          setData(result || []);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setData(null);
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, disabled, includeUser, allowNull, preserve]);

  return { data, loading };
}