import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'; // Corrected import path
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id; 

    const { data: conversations, error } = await supabaseServer
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false }); // Order by most recent activity

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    console.error('API error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}