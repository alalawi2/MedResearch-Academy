import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  console.warn(
    'Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Dashboard will not work.'
  );
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-key'
);
