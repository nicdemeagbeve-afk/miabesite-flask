import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database from the server
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server-side operations
  {
    auth: {
      persistSession: false,
    },
  }
);