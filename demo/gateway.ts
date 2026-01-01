import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import 'dotenv/config';

// Initialize the OpenAI provider with the AI Gateway configuration
const openai = createOpenAI({
  baseURL: 'https://gateway.ai.vercel.dev/openai/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

async function main() {
  try {
    const result = streamText({
      model: openai('gpt-4.1'), // Using the specific model alias from your request
      prompt: 'Invent a new holiday and describe its traditions.',
    });

    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }

    console.log();
    console.log('Token usage:', await result.usage);
    console.log('Finish reason:', await result.finishReason);
  } catch (error) {
    console.error('Error running gateway script:', error);
  }
}

main().catch(console.error);
