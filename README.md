# AI Live Chat Agent - Spur Bot

A Next.js-based AI live chat agent that provides customer support using Google Gemini. This application simulates a customer support chat where an AI agent answers user questions with context-aware responses.

## Features

- 🤖 **AI-Powered Support**: Uses Google Gemini API for intelligent, context-aware responses
- 💬 **Real-time Chat Interface**: Dark mode UI with monospace font and markdown rendering
- 💾 **Conversation Persistence**: All conversations are stored in Neon (serverless PostgreSQL)
- 🔄 **Session Management**: Automatic session handling with conversation history
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Error Handling**: Robust error handling for API failures and edge cases
- 📝 **Markdown Support**: AI responses render markdown formatting (bold, lists, code blocks)

## Tech Stack

- **Frontend**: Next.js 16 (App Router) with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Styling**: Dark mode theme with monospace font (Geist Mono)
- **Backend**: Next.js API Routes (TypeScript)
- **Database**: Neon (serverless PostgreSQL) with Prisma ORM and Neon adapter
- **LLM**: Google Gemini API (gemini-2.5-flash)
- **Markdown**: react-markdown for message formatting
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ and npm
- Neon database account ([Sign up here](https://neon.tech)) or PostgreSQL database
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Set Up Environment Variables

Create a `.env` or `.env.local` file in the root directory:

```env
# Database (Neon connection string)
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key-here"

# App URL (for deployment)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**For Neon Database:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Use the pooled connection string (with `-pooler` in the hostname) for better performance

**Important**: Never commit `.env` or `.env.local` to version control.

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

**Note**: Make sure your `DATABASE_URL` environment variable is set before running `db:push`. The command will create the `Conversation` and `Message` tables in your database.

### 4. Switching Between Neon and PostgreSQL

The application is configured to use **Neon** (serverless PostgreSQL) by default, but you can easily switch to regular PostgreSQL.

#### Current Setup: Neon (Default)

The code in `lib/db.ts` uses the Neon adapter, which is optimized for serverless deployments.

#### Switching to Regular PostgreSQL

If you want to use a regular PostgreSQL database instead of Neon:

1. **Install PostgreSQL adapter packages**:
   ```bash
   npm install @prisma/adapter-pg pg
   ```

2. **Update `lib/db.ts`**:
   - Comment out the Neon imports:
     ```typescript
     // import { PrismaNeon } from "@prisma/adapter-neon";
     ```
   - Uncomment the PostgreSQL imports:
     ```typescript
     import { PrismaPg } from "@prisma/adapter-pg";
     import { Pool } from "pg";
     ```
   - Replace the adapter initialization:
     ```typescript
     // Replace this:
     const adapter = new PrismaNeon({ connectionString });
     
     // With this:
     const pool = new Pool({
       connectionString,
     });
     const adapter = new PrismaPg(pool);
     ```

3. **Update your `DATABASE_URL`** to use a standard PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/spur_bot?schema=public"
   ```

4. **Regenerate Prisma Client**:
   ```bash
   npm run db:generate
   ```

**Note**: The commented code in `lib/db.ts` shows exactly what needs to be changed. Both adapters work with the same Prisma schema, so no schema changes are needed.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
spur-bot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       ├── message/
│   │       │   └── route.ts          # POST /api/chat/message
│   │       └── [sessionId]/
│   │           └── route.ts          # GET /api/chat/[sessionId]
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Main chat page
│   └── globals.css                    # Global styles
├── components/
│   ├── ui/                            # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── scroll-area.tsx
│   │   └── card.tsx
│   └── chat/
│       ├── ChatWidget.tsx             # Main chat container with session management
│       ├── MessageList.tsx            # Scrollable message list with auto-scroll
│       ├── MessageBubble.tsx          # Individual message with markdown rendering
│       ├── ChatInput.tsx              # Input box with send button (Enter to send)
│       └── TypingIndicator.tsx        # "Agent is typing..." indicator
├── lib/
│   ├── db.ts                          # Prisma client with Neon adapter
│   ├── gemini.ts                      # Gemini API service with FAQ knowledge
│   ├── session.ts                     # Session ID generation utilities
│   └── utils.ts                       # General utilities (cn helper)
├── prisma/
│   ├── schema.prisma                  # Database schema (Conversation, Message)
│   └── prisma.config.ts               # Prisma config for Neon
├── types/
│   └── chat.ts                        # TypeScript types
└── README.md
```

## Architecture Overview

### Backend Architecture

The backend follows a layered architecture:

1. **API Routes** (`app/api/chat/`): Handle HTTP requests and responses
   - Input validation
   - Session management
   - Error handling

2. **Service Layer** (`lib/`):
   - `gemini.ts`: LLM integration with FAQ knowledge base and error handling
   - `db.ts`: Prisma client with Neon serverless adapter
   - `session.ts`: Session ID generation and validation

3. **Data Layer** (`prisma/`):
   - Database schema definition
   - Type-safe database access

### Frontend Architecture

The frontend uses React Server Components and Client Components:

1. **Page Component** (`app/page.tsx`): Server component that renders the chat widget
2. **Chat Widget** (`components/chat/ChatWidget.tsx`): Main container managing:
   - Session state (localStorage)
   - Message state
   - API communication
   - Error handling

3. **UI Components**: 
   - Dark mode styling with monospace font
   - Markdown rendering for AI messages (bold, lists, code blocks)
   - Reusable shadcn/ui components for consistent styling

### Data Flow

```
User Input → ChatInput → ChatWidget → API Route → Gemini Service
                                                      ↓
User sees reply ← ChatWidget ← API Response ← Database ← AI Response
```

### UI Design

The application features a **dark mode interface** with the following characteristics:

- **Color Scheme**: 
  - Background: `#0f0f0f` (main), `#1a1a1a` (chat container)
  - User messages: `#3a3a3a` with white text
  - AI messages: `#2a2a2a` with light gray text
  - Borders: `#333` and `#444` for subtle separation

- **Typography**: 
  - Monospace font (Geist Mono) throughout for consistent, technical appearance
  - Proper line spacing and text wrapping

- **Message Rendering**:
  - User messages: Plain text with preserved whitespace
  - AI messages: Full Markdown support with:
    - **Bold text** rendering
    - Bullet and numbered lists
    - Inline code blocks with dark background
    - Proper paragraph spacing

- **UX Features**:
  - Auto-scroll to latest message
  - Typing indicator with animated dots
  - Disabled send button while request is in flight
  - Enter key to send messages
  - Error messages displayed in the UI

## LLM Integration

### Provider: Google Gemini

The application uses Google Gemini 2.5 Flash model via the `@google/generative-ai` SDK.

### Prompting Strategy

1. **System Prompt**: Contains FAQ knowledge base embedded in the conversation history:
   - Shipping policy (costs, delivery times, countries)
   - Return/refund policy (30-day returns, conditions)
   - Support hours (business hours, contact methods)
   - General store information (payment methods, tracking, etc.)

2. **Conversation History**: Last 10 messages are included for context-aware responses

3. **Error Handling**:
   - API key validation
   - Rate limit handling (429 errors)
   - Timeout handling (30s timeout)
   - Quota exceeded errors
   - Invalid API key errors
   - Generic fallback errors with user-friendly messages

### Configuration

- **Model**: `gemini-2.5-flash` (fast and cost-effective)
- **Max Output Tokens**: 500
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max History Messages**: 10
- **Max Message Length**: 4000 characters
- **Request Timeout**: 30 seconds

### Response Formatting

AI responses support Markdown formatting:
- **Bold text** using `**text**`
- *Italic text* using `*text*`
- Bullet lists and numbered lists
- Inline code with backticks
- Proper line breaks and spacing

### Cost Control

- Token limits enforced at the model level
- Message length validation (4000 chars max)
- History truncation (last 10 messages only)

## Database Schema

The database uses Prisma ORM with either Neon (serverless PostgreSQL) or regular PostgreSQL. By default, the application is configured for Neon with the Neon adapter, but you can switch to regular PostgreSQL as described in the setup instructions above.

### Conversations Table

- `id` (UUID, primary key)
- `sessionId` (string, unique, indexed) - Used to track user sessions
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `messages` (relation to Message[])

### Messages Table

- `id` (UUID, primary key)
- `conversationId` (foreign key to conversations, cascade delete)
- `sender` (enum: "user" | "ai")
- `text` (text) - Stores the message content
- `timestamp` (timestamp, indexed) - For chronological ordering

### Database Connection

**Default (Neon)**:
- Uses `@prisma/adapter-neon` for serverless compatibility
- Connection pooling enabled via Neon's pooled connection string
- Automatic connection management for serverless environments

**Alternative (PostgreSQL)**:
- Uses `@prisma/adapter-pg` with connection pooling via `pg` Pool
- Standard PostgreSQL connection string format
- See setup instructions above for switching between adapters

## API Endpoints

### POST `/api/chat/message`

Send a message and receive an AI reply.

**Request Body:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid" // Optional, will be generated if not provided
}
```

**Response:**
```json
{
  "reply": "We offer a 30-day return policy...",
  "sessionId": "uuid-here"
}
```

### GET `/api/chat/[sessionId]`

Retrieve conversation history for a session.

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "sender": "user",
      "text": "Hello",
      "timestamp": "2025-01-01T00:00:00Z"
    }
  ],
  "sessionId": "uuid"
}
```

## How It Works

### User Flow

1. **Initial Load**: 
   - User opens the chat interface
   - System checks localStorage for existing session ID
   - If found, loads conversation history from database
   - If not found, generates new UUID session ID and stores it

2. **Sending a Message**:
   - User types message and presses Enter or clicks Send
   - Message appears immediately (optimistic UI)
   - Send button is disabled to prevent duplicate sends
   - Typing indicator appears
   - Request sent to `/api/chat/message` with message and sessionId

3. **Backend Processing**:
   - API route validates input (non-empty, length check)
   - Gets or creates conversation record using sessionId
   - Retrieves last 10 messages for context
   - Calls Gemini API with FAQ knowledge + conversation history
   - Saves both user and AI messages to database
   - Returns AI response and sessionId

4. **Response Display**:
   - AI message appears with markdown formatting
   - Typing indicator disappears
   - Send button re-enabled
   - Auto-scroll to bottom

5. **Error Handling**:
   - Network errors: User-friendly error message displayed
   - API errors: Specific error messages (rate limit, timeout, etc.)
   - Optimistic message removed on error
   - User can retry by sending another message

### Session Persistence

- Session IDs are stored in browser localStorage
- Conversations persist across page reloads
- Each session maintains its own conversation history
- No authentication required (as per assignment requirements)

### Markdown Rendering

AI responses are parsed and rendered as Markdown:
- `**text**` → **Bold text**
- `*text*` → *Italic text*
- `- item` → Bullet list
- `` `code` `` → Inline code with dark background
- Proper line breaks and spacing

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

### Database Setup for Production

**Recommended: Neon Database**
- Sign up at [neon.tech](https://neon.tech)
- Create a new project
- Use the pooled connection string (with `-pooler` in hostname)
- Add `DATABASE_URL` to Vercel environment variables

**Alternative providers**: Supabase, Railway, Vercel Postgres, etc.

**Important**: For Neon, always use the pooled connection string in production for better performance and connection management.

### Build Commands

```bash
npm run build  # Build for production
npm run start  # Start production server
```

## Trade-offs & Design Decisions

### What We Included

1. **Session Management**: UUID-based sessions stored in localStorage for persistence across page reloads
2. **Error Handling**: Comprehensive error handling at all layers (API, LLM, UI) with user-friendly messages
3. **Input Validation**: Message length limits (4000 chars), empty message checks, disabled send button while loading
4. **Optimistic UI**: User messages appear immediately, then replaced with server response
5. **Auto-scroll**: Messages automatically scroll to bottom when new messages arrive
6. **Typing Indicator**: Visual feedback with animated dots when AI is generating response
7. **Markdown Rendering**: AI responses support markdown formatting (bold, lists, code blocks)
8. **Dark Mode UI**: Modern dark theme with monospace font for consistent styling
9. **Neon Integration**: Serverless PostgreSQL with connection pooling for optimal performance
10. **Conversation History**: Automatic loading of previous messages on page reload

### What We Left Out (Due to Time Constraints)

1. **Authentication**: No user authentication (as per requirements)
2. **Rate Limiting**: No per-user rate limiting (could be added at API level)
3. **Message Editing/Deletion**: No ability to edit or delete messages
4. **File Attachments**: No support for images or files
5. **Multi-language Support**: English only
6. **Analytics**: No conversation analytics or metrics
7. **Admin Dashboard**: No admin interface for viewing all conversations

### If I Had More Time...

1. **Enhanced Error Recovery**: Retry logic with exponential backoff
2. **Streaming Responses**: Stream AI responses token-by-token for better UX
3. **Message Reactions**: Allow users to rate responses (thumbs up/down)
4. **Search Functionality**: Search through conversation history
5. **Export Conversations**: Allow users to download conversation transcripts
6. **Multi-turn Context**: Better context window management for longer conversations
7. **A/B Testing**: Test different prompts and models
8. **Monitoring**: Add logging and monitoring (e.g., Sentry, DataDog)
9. **Caching**: Cache common FAQ responses to reduce API calls
10. **Testing**: Add unit tests, integration tests, and E2E tests

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct and uses the pooled connection string for Neon
- For Neon: Ensure you're using the connection string with `-pooler` in the hostname
- Check that `DATABASE_URL` is set in your `.env` file
- Run `npm run db:push` to create tables if they don't exist
- For Neon: Check that your database project is active (not paused)

### Gemini API Errors

- Verify `GEMINI_API_KEY` is set correctly
- Check API quota/limits in Google Cloud Console
- Ensure API key has proper permissions

### Build Errors

- Run `npm run db:generate` to regenerate Prisma Client
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`
- Ensure all dependencies are installed: `npm install`
- For TypeScript errors: Check that `@prisma/adapter-neon` is installed if using Neon

## License

This project is created for the Spur Software Engineer Hiring Assignment.

## Contact

For questions or issues, please refer to the assignment submission form.
