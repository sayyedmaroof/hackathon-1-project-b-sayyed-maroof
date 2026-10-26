import { StatusScreen } from "@/components/layout/status-screen";

export default function MarketingNotFound() {
  return (
    <StatusScreen
      eyebrow="Missing page"
      title="We couldn't find that page."
      body="Try the hack guides, or start with a route you already have in mind."
      actionHref="/hacks"
      actionLabel="Browse hacks"
    />
  );
}
