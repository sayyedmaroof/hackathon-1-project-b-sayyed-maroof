import { ChatScreen } from "@/components/chat/chat-screen";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return <ChatScreen locale={locale === "en" ? "en" : "es"} conversationId={id} />;
}
