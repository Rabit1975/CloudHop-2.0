import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import 'dotenv/config'

// Configure to use Vercel AI Gateway
const gateway = createOpenAI({
  baseURL: 'https://gateway.ai.vercel.dev/openai/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY, // Use the vck_ key
})

async function main() {
  try {
    const messages = [{ role: 'user', content: 'Hello, are you working?' }]

    console.log("Testing Vercel AI Gateway routing to Novita...");
    
    // Try to access Novita model via Gateway
    const model = gateway('novita/kat-coder');

    const result = await generateText({
      model,
      messages,
    })

    console.log("Success!");
    console.log(result.text);
  } catch (error) {
    console.error('Error in example script:');
    if (error.responseBody) {
        console.error(error.responseBody);
    } else {
        console.error(error);
    }
  }
}

main().catch(console.error)
