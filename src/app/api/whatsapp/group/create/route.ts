import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { instanceId, groupName, description, participants } = await request.json();

    if (!instanceId || !groupName || !participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: instanceId, groupName, and participants (array of numbers)' }, { status: 400 });
    }

    const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

    if (!API_SERVER_URL || !API_KEY) {
      return NextResponse.json({ error: 'Evolution API URL or Key is not configured in .env file.' }, { status: 500 });
    }

    const evolutionApiUrl = `${API_SERVER_URL}/group/create/${instanceId}`;
    const options = {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: groupName, // Assuming 'subject' is the group name string
        description: description || '', // Description is optional
        participants: participants, // Array of numbers like ["553198296801@s.whatsapp.net"]
      }),
    };

    const response = await fetch(evolutionApiUrl, options);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Evolution API:', errorData);
      return NextResponse.json(
        { error: `Evolution API request failed: ${errorData.message || JSON.stringify(errorData)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('API error creating group:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}