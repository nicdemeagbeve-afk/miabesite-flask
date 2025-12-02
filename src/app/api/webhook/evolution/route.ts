import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// Define the expected structure of the Evolution API webhook payload
interface MessageUpsertData {
  key: {
    remoteJid: string; // WhatsApp number of the contact
    fromMe: boolean; // true if sent by bot, false if sent by client
    id: string; // Message ID
  };
  message: {
    conversation?: string; // Text message content
    extendedTextMessage?: {
      text: string;
    };
    // Add other message types as needed (imageMessage, videoMessage, etc.)
  };
  pushName?: string; // Contact name
  messageTimestamp: number;
}

interface ConnectionUpdateData {
  instance: {
    instanceName: string;
    state: "open" | "close" | "connecting" | "created";
  };
}

interface QrCodeUpdateData {
  // Define structure for QR code updates if needed, based on API docs
  // For now, we'll keep it minimal as the console.log only uses instanceId
  instance: {
    instanceName: string;
    qrcode: string; // base64 QR code
    pairingCode?: string;
  };
}

interface InstanceStatusUpdateData {
  instance: {
    instanceName: string;
    status: "created" | "ready" | "error";
  };
}

type EvolutionWebhookPayload =
  | { event: 'messages.upsert'; instance: string; id: string; data: MessageUpsertData }
  | { event: 'connection.update'; instance: string; id: string; data: ConnectionUpdateData }
  | { event: 'qr.code'; instance: string; id: string; data: QrCodeUpdateData }
  | { event: 'instance.status'; instance: string; id: string; data: InstanceStatusUpdateData };


export async function POST(request: Request) {
  try {
    const payload: EvolutionWebhookPayload = await request.json();
    const { instance: instanceId, event, data } = payload;

    if (!instanceId || !event || !data) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    console.log(`Received webhook event: ${event} for instance: ${instanceId}`);

    switch (event) {
      case 'messages.upsert': {
        const { key, message, pushName, messageTimestamp } = data;
        const isFromMe = key.fromMe;
        const remoteJid = key.remoteJid; // e.g., "1234567890@s.whatsapp.net"
        const evolutionMessageId = key.id; // Unique ID from Evolution API

        // Extract text content
        const text = message.conversation || message.extendedTextMessage?.text || '';

        if (!text) {
          console.log('Ignoring non-text message or empty message.');
          return NextResponse.json({ message: 'Non-text message or empty message ignored' }, { status: 200 });
        }

        // Assuming user_id is the same as instanceId for simplicity in this context
        // In a real app, you'd map instanceId to your internal user_id
        const userId = instanceId; 
        const contactNumber = remoteJid.split('@')[0]; // Extract number from JID

        // Find or create conversation
        let { data: conversation, error: convError } = await supabaseServer
          .from('conversations')
          .select('*')
          .eq('instance_id', instanceId)
          .eq('contact_number', contactNumber)
          .single();

        if (convError && convError.code === 'PGRST116') { // No rows found
          // Create new conversation
          const { data: newConv, error: newConvError } = await supabaseServer
            .from('conversations')
            .insert({
              user_id: userId,
              instance_id: instanceId,
              contact_name: pushName || contactNumber, // Use pushName if available, else number
              contact_number: contactNumber,
              last_activity: new Date(messageTimestamp * 1000).toISOString(),
              status: 'En cours',
              unread_messages: isFromMe ? 0 : 1, // Mark as unread if from client
            })
            .select()
            .single();

          if (newConvError) {
            console.error('Error creating new conversation:', newConvError);
            return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
          }
          conversation = newConv;
        } else if (convError) {
          console.error('Error fetching conversation:', convError);
          return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
        } else {
          // Update existing conversation
          const { error: updateConvError } = await supabaseServer
            .from('conversations')
            .update({
              last_activity: new Date(messageTimestamp * 1000).toISOString(),
              unread_messages: isFromMe ? conversation.unread_messages : conversation.unread_messages + 1,
              status: 'En cours', // Always set to 'En cours' on new message
            })
            .eq('id', conversation.id);

          if (updateConvError) {
            console.error('Error updating conversation:', updateConvError);
            return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
          }
        }

        // Insert message
        const { error: msgError } = await supabaseServer
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender: isFromMe ? 'ai' : 'client',
            text: text,
            timestamp: new Date(messageTimestamp * 1000).toISOString(),
            evolution_message_id: evolutionMessageId,
          });

        if (msgError) {
          // Handle duplicate message ID if Evolution API sends multiple upserts for the same message
          if (msgError.code === '23505') { // Unique violation code
            console.warn(`Duplicate message ID received: ${evolutionMessageId}. Ignoring.`);
            return NextResponse.json({ message: 'Duplicate message ignored' }, { status: 200 });
          }
          console.error('Error inserting message:', msgError);
          return NextResponse.json({ error: 'Failed to insert message' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Message processed successfully' }, { status: 200 });
      }

      case 'connection.update': {
        // Handle connection status updates (e.g., 'open', 'close', 'connecting')
        // You might want to update a 'status' field in your 'instances' table in Supabase
        console.log(`Instance ${instanceId} connection status updated: ${data.instance.state}`);
        return NextResponse.json({ message: 'Connection update processed' }, { status: 200 });
      }

      case 'qr.code': {
        // Handle QR code updates (e.g., store the QR code in a temporary location or notify the user)
        console.log(`Instance ${instanceId} QR code updated.`);
        return NextResponse.json({ message: 'QR code update processed' }, { status: 200 });
      }

      case 'instance.status': {
        // Handle instance status updates (e.g., 'created', 'ready', 'error')
        console.log(`Instance ${instanceId} status updated.`);
        return NextResponse.json({ message: 'Instance status update processed' }, { status: 200 });
      }

      default:
        console.log(`Unhandled event type: ${event}`);
        return NextResponse.json({ message: 'Unhandled event type' }, { status: 200 });
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}