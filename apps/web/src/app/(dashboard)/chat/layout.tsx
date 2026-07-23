import { ChatSidebar } from "@/features/chat/components/chat-sidebar"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border bg-background shadow-xl ring-1 ring-white/10 mt-2">
      {/* Secondary sidebar for chat history */}
      <ChatSidebar className="hidden md:flex border-r" />
      
      {/* Main chat area */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  )
}
