import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function PUT(request: Request, { params }: { params: { conversationId: string } }) {
  try {
    const { conversationId } = params;

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // In a real application, you would also verify that the conversationId belongs to the authenticated user.

    const { error } = await supabaseServer
      .from('conversations')
      .update({ unread_messages: 0 })
      .eq('id', conversationId);

    if (error) {
      console.error('Error marking conversation as read:', error);
      return NextResponse.json({ error: 'Failed to mark conversation as read' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Conversation marked as read' }, { status: 200 });
  } catch (error) {
    console.error('API error marking conversation as read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}