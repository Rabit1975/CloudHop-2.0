# CloudHop AI Studio Application Rules

This document outlines the core technologies and library usage guidelines for the CloudHop application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen tech stack.

## Tech Stack Overview

1.  **React:** The application is built using React for its component-based architecture and efficient UI rendering.
2.  **TypeScript:** All application code is written in TypeScript, providing static type checking for improved code quality and developer experience.
3.  **Vite:** Vite is used as the build tool, offering a fast development server and optimized production builds.
4.  **Tailwind CSS:** Styling is handled exclusively with Tailwind CSS, enabling rapid UI development through utility-first classes.
5.  **Supabase:** Supabase serves as the backend-as-a-service, managing authentication, real-time database interactions, and other backend functionalities.
6.  **Google Gemini API (GenAI):** The `@google/genai` library is integrated for all AI-powered features, including summarization, content rewriting, translation, and transcription.
7.  **Framer Motion:** Declarative animations and transitions are implemented using Framer Motion to create smooth and engaging user interfaces.
8.  **Vercel Speed Insights:** Performance monitoring and optimization are integrated via Vercel Speed Insights.
9.  **Custom View Management:** The application manages its different "views" (pages) using React's `useState` and a `switch` statement within `App.tsx`, providing a lightweight routing solution.

## Library Usage Rules

*   **UI Components:**
    *   **Preferred:** Utilize `shadcn/ui` components for pre-built, accessible, and customizable UI elements.
    *   **Fallback:** If a specific component is not available in `shadcn/ui` or requires highly custom styling, create new components using Tailwind CSS directly.
*   **Styling:**
    *   **Mandatory:** All styling must be implemented using Tailwind CSS utility classes. Avoid inline styles or custom CSS files unless absolutely necessary for complex, non-Tailwind-achievable effects.
*   **Icons:**
    *   **Preferred:** Use icons from the `lucide-react` library.
    *   **Fallback:** If a required icon is not available in `lucide-react`, custom SVG icons can be added to `src/constants.tsx`.
*   **State Management:**
    *   **Standard:** For component-level and local state, use React's `useState` hook.
    *   **Global State:** For application-wide state, leverage React's Context API (e.g., `SpaceContext`) to share data across components. Avoid external state management libraries unless a clear need arises for more complex patterns.
*   **Routing/View Management:**
    *   **Existing Pattern:** Continue to manage application views by updating the `view` state in `App.tsx` and rendering components conditionally using a `switch` statement.
*   **Backend Interactions:**
    *   **Exclusive:** All interactions with the backend (authentication, database operations, real-time subscriptions) must be done through the Supabase client (`src/lib/supabaseClient.ts`).
*   **AI Functionality:**
    *   **Exclusive:** All AI-related features and integrations must use the `@google/genai` library.
*   **Animations:**
    *   **Standard:** Implement all animations and transitions using `framer-motion`.