import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidSessionId } from "@/lib/session";
import type { ChatHistoryResponse } from "@/types/chat";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Validate sessionId format
    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID format" },
        { status: 400 }
      );
    }

    // Find conversation
    const conversation = await db.conversation.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const response: ChatHistoryResponse = {
      messages: conversation.messages,
      sessionId: conversation.sessionId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/chat/[sessionId]:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

