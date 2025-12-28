export type MessageSender = "user" | "ai";

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface ChatMessageRequest {
  message: string;
  sessionId?: string;
}

export interface ChatMessageResponse {
  reply: string;
  sessionId: string;
}

export interface ChatHistoryResponse {
  messages: Message[];
  sessionId: string;
}

