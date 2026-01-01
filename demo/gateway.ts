import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import 'dotenv/config';

async function main() {
  const openai = createOpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: 'https://gateway.ai.vercel.dev/openai/v1', // Common Vercel AI Gateway Endpoint
  });

  const result = streamText({
    model: openai('gpt-4.1'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  console.log();
  console.log('Token usage:', await result.usage);
  console.log('Finish reason:', await result.finishReason);
}

main().catch(console.error);
