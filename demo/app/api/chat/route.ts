import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import 'dotenv/config';

export async function POST(req: Request) {
  try {
    // Extract the `messages` from the body of the request
    const { messages } = await req.json();

    // Get a language model
    // Using gpt-4o as requested in previous turns (or gpt-4o-mini as in user snippet)
    // User snippet said 'gpt-4o-mini', I'll stick to that.
    // Configure OpenAI to use Vercel AI Gateway
    const openai = createOpenAI({
      baseURL: 'https://gateway.ai.vercel.dev/openai/v1',
      apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
    });
    
    const model = openai('gpt-4o-mini');

    // Call the language model with the prompt
    const result = streamText({
      model,
      messages,
      maxTokens: 8192,
      temperature: 0.7,
      topP: 1,
      providerOptions: {
        gateway: {
          order: ['openai', 'anthropic'], // Example ordering as per docs
        },
      },
    });

    // Respond with a streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in route handler:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
