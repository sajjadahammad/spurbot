import { ChatWidget } from "@/components/chat/ChatWidget";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#0f0f0f]">
      <div className="w-full max-w-4xl">
        <ChatWidget />
      </div>
    </main>
  );
}
