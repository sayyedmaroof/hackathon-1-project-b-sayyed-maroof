import { ChatScreen } from "@/components/chat/chat-screen";

export default async function ChatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ChatScreen locale={locale === "en" ? "en" : "es"} />;
}
