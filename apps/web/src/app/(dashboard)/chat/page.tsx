import dynamic from "next/dynamic"

const ChatInterface = dynamic(
  () => import("@/features/chat/components/chat-interface").then((mod) => mod.ChatInterface),
  { ssr: false }
)

export default function ChatPage() {
  // A completely new chat doesn't have an ID yet, so we pass a dummy or generate one later
  return <ChatInterface chatId="new" />
}
