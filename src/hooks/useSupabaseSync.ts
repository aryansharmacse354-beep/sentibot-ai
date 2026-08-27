'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSentiBot } from '@/context/SentiBotContext';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function useSupabaseSync() {
  const { activeSessionId, overrideEscalation } = useSentiBot();

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Subscribe to real-time websocket escalation updates
    const channel = supabase
      .channel('public:escalations')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'escalations' },
        (payload) => {
          if (payload.new && payload.new.session_id === activeSessionId) {
            overrideEscalation(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSessionId, overrideEscalation]);
}
