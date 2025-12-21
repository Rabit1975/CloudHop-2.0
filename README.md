<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/14Jtylo5QYnTkdaTI97XlpNNau8ghjd9T

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env` (create this file) to your Gemini API key:
   ```
   GEMINI_API_KEY=AIzaSy...
   ```
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Push your code to a git repository (GitHub, GitLab, etc.).
2. Import the project in Vercel.
3. In the **Environment Variables** section of the deployment settings, add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key from Google AI Studio.
4. Deploy.
