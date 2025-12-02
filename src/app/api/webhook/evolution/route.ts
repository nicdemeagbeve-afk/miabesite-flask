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

// Placeholder for AI API call
async function callAIApi(prompt: string, messageText: string): Promise<string> {
  // In a real application, you would integrate with an actual AI service here (e.g., OpenAI, Google Gemini).
  // This is a simplified mock for demonstration purposes.
  console.log(`Calling AI with prompt: "${prompt}" and message: "${messageText}"`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing time

  if (messageText.toLowerCase().includes("bonjour")) {
    return "Bonjour ! Comment puis-je vous aider aujourd'hui ?";
  } else if (messageText.toLowerCase().includes("prix")) {
    return "Nos prix varient en fonction du service. Pourriez-vous préciser votre demande ?";
  } else if (messageText.toLowerCase().includes("merci")) {
    return "De rien ! N'hésitez pas si vous avez d'autres questions.";
  } else if (messageText.toLowerCase().includes("aide")) {
    return "Je suis là pour vous aider. Dites-moi ce dont vous avez besoin.";
  } else if (messageText.toLowerCase().includes("prompt")) {
    return `Mon prompt actuel est : "${prompt}".`;
  }
  return "Je n'ai pas compris votre demande. Pouvez-vous reformuler ?";
}

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

        // Insert incoming message
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

        // --- AI Interaction Logic ---
        if (!isFromMe) { // Only process messages from the client
          // 1. Fetch AI prompt for this instance from Supabase
          const { data: aiPromptData, error: aiPromptError } = await supabaseServer
            .from('ai_prompts')
            .select('main_prompt')
            .eq('instance_id', instanceId)
            .single();

          let mainPrompt = aiPromptData?.main_prompt || "Tu es un assistant IA serviable et amical.";
          if (aiPromptError && aiPromptError.code !== 'PGRST116') {
            console.error('Error fetching AI prompt for instance:', instanceId, aiPromptError);
            // Continue with default prompt if there's an error
          }

          // 2. Call AI API (mocked for now)
          const aiResponseText = await callAIApi(mainPrompt, text);

          // 3. Send AI response back via Evolution API
          const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;
          const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // Global API key for Evolution API

          if (!API_SERVER_URL || !API_KEY) {
            console.error("Evolution API_SERVER_URL or API_KEY not configured for sending messages.");
            return NextResponse.json({ error: 'Evolution API not configured' }, { status: 500 });
          }

          const sendResponse = await fetch(`${API_SERVER_URL}/message/sendText/${instanceId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': API_KEY,
            },
            body: JSON.stringify({
              number: contactNumber, // WhatsApp number of the recipient
              textMessage: {
                text: aiResponseText,
              },
            }),
          });

          if (!sendResponse.ok) {
            const errorData = await sendResponse.json();
            console.error('Error sending AI message via Evolution API:', sendResponse.status, errorData);
            // Log this error but don't necessarily fail the webhook, as the incoming message was processed.
          } else {
            console.log(`AI response sent to ${contactNumber} via instance ${instanceId}`);
            // 4. Store AI response in Supabase
            const { error: aiMsgError } = await supabaseServer
              .from('messages')
              .insert({
                conversation_id: conversation.id,
                sender: 'ai',
                text: aiResponseText,
                timestamp: new Date().toISOString(),
                // evolution_message_id: (optional, if Evolution API returns one for sent messages)
              });

            if (aiMsgError) {
              console.error('Error inserting AI response message:', aiMsgError);
            }
          }
        }

        return NextResponse.json({ message: 'Message processed successfully' }, { status: 200 });
      }

      case 'connection.update': {
        console.log(`Instance ${instanceId} connection status updated: ${data.instance.state}`);
        return NextResponse.json({ message: 'Connection update processed' }, { status: 200 });
      }

      case 'qr.code': {
        console.log(`Instance ${instanceId} QR code updated.`);
        return NextResponse.json({ message: 'QR code update processed' }, { status: 200 });
      }

      case 'instance.status': {
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