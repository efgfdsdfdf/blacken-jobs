import { ChatInterface } from "@/features/chat/components/chat-interface"

export default function ChatPage() {
  // A completely new chat doesn't have an ID yet, so we pass a dummy or generate one later
  return <ChatInterface chatId="new" />
}
