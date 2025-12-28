export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-[#2a2a2a] text-gray-300 rounded-lg px-4 py-2 border border-[#333]">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

