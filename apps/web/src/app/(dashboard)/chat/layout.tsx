import { ChatSidebar } from "@/features/chat/components/chat-sidebar"
import { MobileChatSidebar } from "@/features/chat/components/mobile-chat-sidebar"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border bg-background shadow-xl ring-1 ring-white/10 mt-2 relative">
      {/* Secondary sidebar for chat history (Desktop) */}
      <ChatSidebar className="hidden md:flex border-r" />
      
      {/* Mobile Chat History Toggle */}
      <MobileChatSidebar />

      {/* Main chat area */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  )
}
