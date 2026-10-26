import { StatusScreen } from "@/components/layout/status-screen";

export default function NotFound() {
  return (
    <StatusScreen
      eyebrow="404"
      title="That boarding pass isn't on this flight."
      body="The page is missing. The fare you wanted might still be on the plan screen."
      actionHref="/plan"
      actionLabel="Check a trip"
    />
  );
}
