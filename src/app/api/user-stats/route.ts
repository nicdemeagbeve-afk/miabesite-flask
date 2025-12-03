import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    
    const cookieMethods = {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        cookieStore.set(name, value, options);
      },
      delete: (name: string) => {
        cookieStore.delete(name);
      },
    };

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookieMethods,
      }
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // First, fetch all conversation IDs for the current user
    const { data: conversationIdsData, error: convIdsError } = await supabaseServer
      .from('conversations')
      .select('id')
      .eq('user_id', userId);

    if (convIdsError) {
      console.error('Error fetching conversation IDs:', convIdsError);
      return NextResponse.json({ error: 'Failed to fetch conversation IDs' }, { status: 500 });
    }

    const conversationIds = conversationIdsData.map(conv => conv.id);

    // Fetch total messages processed by the user's instances using the fetched conversation IDs
    const { count: messagesProcessed, error: messagesError } = await supabaseServer
      .from('messages')
      .select('id', { count: 'exact' })
      .in('conversation_id', conversationIds); // Now passing an array of IDs

    if (messagesError) {
      console.error('Error fetching messages count:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages count' }, { status: 500 });
    }

    // Placeholder for total quota (e.g., from a user_plans table or a fixed value)
    const totalQuota = 50000; // Example: 50,000 messages per month
    const quotaUsedPercentage = messagesProcessed ? Math.min(100, (messagesProcessed / totalQuota) * 100) : 0;

    return NextResponse.json({
      messagesProcessed: messagesProcessed || 0,
      totalQuota,
      quotaUsed: Math.round(quotaUsedPercentage),
      responseRate: 0, // Placeholder, requires more complex backend logic
      avgResponseTime: 0, // Placeholder, requires more complex backend logic
    }, { status: 200 });

  } catch (error) {
    console.error('API error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}