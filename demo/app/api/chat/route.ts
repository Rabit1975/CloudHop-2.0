import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import 'dotenv/config';

// Configure OpenAI to use Vercel AI Gateway
// The key 'vck_...' is a Vercel Cloud Key, so we must use the Vercel Gateway endpoint.
const openai = createOpenAI({
  baseURL: 'https://gateway.ai.vercel.dev/openai/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Use Vercel AI Gateway to route to Novita
    // We specify the provider/model format: 'novita/kat-coder'
    const model = openai('novita/kat-coder');

    const result = streamText({
      model,
      messages,
      maxOutputTokens: 16000,
      temperature: 0.7,
      topP: 1,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in route handler:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
