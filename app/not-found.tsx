import { StatusScreen } from "@/components/layout/status-screen";

export default function NotFound() {
  return (
    <StatusScreen
      eyebrow="404"
      title="That boarding pass is not on this flight."
      body="This page does not exist. The chat is still there."
      actionHref="/chat"
      actionLabel="Open the chat"
      photo="cabin"
    />
  );
}
