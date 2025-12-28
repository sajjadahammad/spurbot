# AI Live Chat Agent - Spur Bot

A Next.js-based AI live chat agent that provides customer support using Google Gemini. This application simulates a customer support chat where an AI agent answers user questions with context-aware responses.

## Features

- 🤖 **AI-Powered Support**: Uses Google Gemini API for intelligent, context-aware responses
- 💬 **Real-time Chat Interface**: Clean, modern chat UI built with shadcn/ui
- 💾 **Conversation Persistence**: All conversations are stored in PostgreSQL
- 🔄 **Session Management**: Automatic session handling with conversation history
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Error Handling**: Robust error handling for API failures and edge cases

## Tech Stack

- **Frontend**: Next.js 16 (App Router) with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Backend**: Next.js API Routes (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **LLM**: Google Gemini API
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/spur_bot?schema=public"

# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key-here"

# App URL (for deployment)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important**: Never commit `.env.local` to version control. The `.env.example` file is provided as a template.

### 3. Set Up Database

#### Option A: Using Prisma Migrate (Recommended)

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create database schema
npm run db:migrate
```

#### Option B: Using Prisma Push (For Development)

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables without migrations)
npm run db:push
```

### 4. Run the Development Server

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
│       ├── ChatWidget.tsx             # Main chat container
│       ├── MessageList.tsx            # Scrollable message list
│       ├── MessageBubble.tsx          # Individual message component
│       ├── ChatInput.tsx              # Input box with send button
│       └── TypingIndicator.tsx        # "Agent is typing..." indicator
├── lib/
│   ├── db.ts                          # Prisma client singleton
│   ├── gemini.ts                      # Gemini API service
│   ├── session.ts                     # Session management utilities
│   └── utils.ts                       # General utilities (cn helper)
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── migrations/                    # Migration files
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
   - `gemini.ts`: LLM integration with error handling
   - `db.ts`: Database access via Prisma
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

3. **UI Components**: Reusable shadcn/ui components for consistent styling

### Data Flow

```
User Input → ChatInput → ChatWidget → API Route → Gemini Service
                                                      ↓
User sees reply ← ChatWidget ← API Response ← Database ← AI Response
```

## LLM Integration

### Provider: Google Gemini

The application uses Google Gemini Pro model via the `@google/generative-ai` SDK.

### Prompting Strategy

1. **System Prompt**: Contains FAQ knowledge about:
   - Shipping policy (costs, delivery times, countries)
   - Return/refund policy (30-day returns, conditions)
   - Support hours (business hours, contact methods)
   - General store information

2. **Conversation History**: Last 10 messages are included for context

3. **Error Handling**:
   - API key validation
   - Rate limit handling
   - Timeout handling (30s timeout)
   - Quota exceeded errors
   - Generic fallback errors

### Configuration

- **Model**: `gemini-pro`
- **Max Output Tokens**: 500
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max History Messages**: 10
- **Max Message Length**: 4000 characters
- **Request Timeout**: 30 seconds

### Cost Control

- Token limits enforced at the model level
- Message length validation (4000 chars max)
- History truncation (last 10 messages only)

## Database Schema

### Conversations Table

- `id` (UUID, primary key)
- `sessionId` (string, unique, indexed)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Messages Table

- `id` (UUID, primary key)
- `conversationId` (foreign key to conversations)
- `sender` (enum: "user" | "ai")
- `text` (text)
- `timestamp` (timestamp, indexed)

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

For Vercel, you can use:
- **Vercel Postgres**: Integrated PostgreSQL database
- **External providers**: Neon, Supabase, Railway, etc.

Update `DATABASE_URL` in Vercel environment variables.

### Build Commands

```bash
npm run build  # Build for production
npm run start  # Start production server
```

## Trade-offs & Design Decisions

### What We Included

1. **Session Management**: UUID-based sessions stored in localStorage for persistence across page reloads
2. **Error Handling**: Comprehensive error handling at all layers (API, LLM, UI)
3. **Input Validation**: Message length limits, empty message checks
4. **Optimistic UI**: User messages appear immediately, then replaced with server response
5. **Auto-scroll**: Messages automatically scroll to bottom
6. **Typing Indicator**: Visual feedback when AI is generating response

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

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network/firewall settings

### Gemini API Errors

- Verify `GEMINI_API_KEY` is set correctly
- Check API quota/limits in Google Cloud Console
- Ensure API key has proper permissions

### Build Errors

- Run `npm run db:generate` to regenerate Prisma Client
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## License

This project is created for the Spur Software Engineer Hiring Assignment.

## Contact

For questions or issues, please refer to the assignment submission form.
