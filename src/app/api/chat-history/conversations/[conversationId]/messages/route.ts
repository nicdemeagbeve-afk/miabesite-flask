import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  try {
    const { conversationId } = params;

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    const supabase = createServerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Verify that the conversation belongs to the authenticated user
    const { data: conversation, error: convError } = await supabaseServer
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conversation) {
      console.error('Conversation not found or does not belong to user:', convError);
      return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 403 });
    }

    const { data: messages, error } = await supabaseServer
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true }); // Order by oldest message first

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('API error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}