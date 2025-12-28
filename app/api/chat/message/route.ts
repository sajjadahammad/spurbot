import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateReply } from "@/lib/gemini";
import { generateSessionId, isValidSessionId } from "@/lib/session";
import type { ChatMessageRequest, ChatMessageResponse } from "@/types/chat";

const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: NextRequest) {
  try {
    const body: ChatMessageRequest = await request.json();
    const { message, sessionId: providedSessionId } = body;

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validate or generate sessionId
    let sessionId: string;
    if (providedSessionId && isValidSessionId(providedSessionId)) {
      sessionId = providedSessionId;
    } else {
      sessionId = generateSessionId();
    }

    // Get or create conversation
    let conversation = await db.conversation.findUnique({
      where: { sessionId },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: { sessionId },
      });
    }

    // Persist user message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        sender: "user",
        text: trimmedMessage,
      },
    });

    // Fetch conversation history
    const messages = await db.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { timestamp: "asc" },
    });

    // Generate AI reply
    let aiReply: string;
    try {
      aiReply = await generateReply(messages, trimmedMessage);
    } catch (error) {
      console.error("Error generating reply:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
      
      // Return error message as AI reply so user sees it
      aiReply = `I apologize, but I'm experiencing technical difficulties. ${errorMessage}`;
    }

    // Persist AI response
    await db.message.create({
      data: {
        conversationId: conversation.id,
        sender: "ai",
        text: aiReply,
      },
    });

    // Update conversation timestamp
    await db.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    const response: ChatMessageResponse = {
      reply: aiReply,
      sessionId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in POST /api/chat/message:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

