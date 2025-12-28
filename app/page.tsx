import { ChatWidget } from "@/components/chat/ChatWidget";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Support Chat</h1>
          <p className="text-muted-foreground">
            Ask me anything about shipping, returns, or support hours
          </p>
        </div>
        <ChatWidget />
      </div>
    </main>
  );
}
