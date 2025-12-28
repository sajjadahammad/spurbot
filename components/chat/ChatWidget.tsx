"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Message, ChatMessageResponse } from "@/types/chat";
// Generate session ID in browser
function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const SESSION_STORAGE_KEY = "chat_session_id";

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize session
  useEffect(() => {
    const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Load conversation history
      loadHistory(storedSessionId);
    } else {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
    }
  }, []);

  const loadHistory = async (sessionIdToLoad: string) => {
    try {
      const response = await fetch(`/api/chat/${sessionIdToLoad}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const handleSend = useCallback(
    async (userMessage: string) => {
      if (!sessionId || isLoading) return;

      // Add user message optimistically
      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        conversationId: "",
        sender: "user",
        text: userMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setIsTyping(true);
      setError(null);

      try {
        const response = await fetch("/api/chat/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            sessionId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to send message");
        }

        const data: ChatMessageResponse = await response.json();

        // Update session ID if it changed
        if (data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId);
        }

        // Replace temporary user message and add AI response
        setMessages((prev) => {
          const withoutTemp = prev.filter((msg) => msg.id !== userMsg.id);
          return [
            ...withoutTemp,
            {
              ...userMsg,
              id: `user-${Date.now()}`,
            },
            {
              id: `ai-${Date.now()}`,
              conversationId: "",
              sender: "ai",
              text: data.reply,
              timestamp: new Date(),
            },
          ];
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        // Remove the optimistic user message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMsg.id));
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [sessionId, isLoading]
  );

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto font-mono bg-[#1a1a1a] border-[#333]">
      <CardHeader className="border-b border-[#333]">
        <CardTitle className="text-white">AI Support Chat</CardTitle>
        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <MessageList messages={messages} isTyping={isTyping} />
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </CardContent>
    </Card>
  );
}

