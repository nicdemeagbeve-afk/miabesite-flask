import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    // In a real application, the userId would come from an authenticated session.
    // For now, we'll use a hardcoded instanceId as the userId for demonstration.
    const userId = "user_123"; 

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