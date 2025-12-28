export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2 shadow-sm">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

