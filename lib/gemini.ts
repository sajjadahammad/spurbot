import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Message } from "@/types/chat";

const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_TOKENS = 500;

// FAQ Knowledge Base
const FAQ_KNOWLEDGE = `
You are a helpful support agent for a small e-commerce store. Here's important information you should know:

SHIPPING POLICY:
- We ship worldwide via standard shipping (5-7 business days) and express shipping (2-3 business days)
- Standard shipping costs $5.99, express shipping costs $14.99
- Free shipping on orders over $50
- We ship to USA, Canada, UK, Australia, and most European countries
- Orders are processed within 1-2 business days

RETURN/REFUND POLICY:
- 30-day return policy from date of delivery
- Items must be in original condition with tags attached
- Refunds are processed within 5-7 business days after we receive the returned item
- Return shipping is free for defective or incorrect items
- For other returns, customer is responsible for return shipping costs

SUPPORT HOURS:
- Monday to Friday: 9:00 AM - 6:00 PM EST
- Saturday: 10:00 AM - 4:00 PM EST
- Sunday: Closed
- Email support: support@store.com
- Response time: Within 24 hours during business hours

GENERAL INFORMATION:
- We accept all major credit cards, PayPal, and Apple Pay
- Orders typically ship within 1-2 business days
- You can track your order using the tracking number sent via email
- For urgent inquiries, please call our support line during business hours

Answer questions clearly and concisely. If you don't know something specific, politely say so and offer to help them contact support.
`;

export async function generateReply(
  history: Message[],
  userMessage: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // Validate message length
  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 0.7,
      },
    });

    // Build conversation history (last N messages)
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
    
    // Format history for Gemini (excluding current user message)
    const conversationHistory = recentHistory.map((msg) => {
      const role = msg.sender === "user" ? "user" : "model";
      return {
        role,
        parts: [{ text: msg.text }],
      };
    });

    // Start chat with history
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: FAQ_KNOWLEDGE }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm ready to help customers with their questions about shipping, returns, support hours, and other store-related inquiries." }],
        },
        ...conversationHistory,
      ],
    });

    // Generate response with current user message
    const result = await Promise.race([
      chat.sendMessage(userMessage),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      ),
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from AI");
    }

    return text.trim();
  } catch (error: unknown) {
    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes("API_KEY_INVALID") || error.message.includes("401")) {
        throw new Error("Invalid API key. Please check your GEMINI_API_KEY configuration.");
      }
      if (error.message.includes("429") || error.message.includes("rate limit")) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (error.message.includes("timeout") || error.message.includes("Request timeout")) {
        throw new Error("Request timed out. Please try again.");
      }
      if (error.message.includes("quota") || error.message.includes("QUOTA_EXCEEDED")) {
        throw new Error("API quota exceeded. Please check your usage limits.");
      }
    }

    // Generic error handling
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate response. Please try again later.");
  }
}

