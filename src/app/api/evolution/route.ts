import { NextResponse } from 'next/server';

export async function GET() {
  const evolutionApiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
  const evolutionApiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;

  if (!evolutionApiUrl || !evolutionApiKey) {
    return NextResponse.json(
      { error: 'Evolution API URL or Key is not configured in .env file.' },
      { status: 500 }
    );
  }

  try {
    const url = `${evolutionApiUrl}/instance/fetchInstances`;
    const options = {
      method: 'GET',
      headers: {
        'apikey': evolutionApiKey,
      },
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: `Evolution API request failed with status ${response.status}: ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'An unexpected error occurred.', details: error.message },
      { status: 500 }
    );
  }
}
