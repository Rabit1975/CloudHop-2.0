import { POST } from './app/api/chat/route';
import 'dotenv/config';

async function main() {
  // Mock a Request object
  const mockRequest = new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Tell me a joke about clouds.' }
      ]
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log("Sending request to POST handler...");
  const response = await POST(mockRequest);

  if (!response.ok) {
    console.error(`Request failed with status ${response.status}`);
    console.error(await response.text());
    return;
  }

  if (!response.body) {
    console.error("No response body");
    return;
  }

  // Read the stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  console.log("Streaming response:");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    process.stdout.write(decoder.decode(value, { stream: true }));
  }
  console.log("\nDone.");
}

main().catch(console.error);
