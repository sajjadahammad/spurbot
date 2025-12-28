import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.text}
        </p>
        <p
          className={cn(
            "text-xs mt-1 opacity-70",
            isUser ? "text-right" : "text-left"
          )}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
}

