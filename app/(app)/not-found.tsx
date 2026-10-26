import { StatusScreen } from "@/components/layout/status-screen";

export default function AppNotFound() {
  return (
    <StatusScreen
      eyebrow="Not on this itinerary"
      title="We don't have that trip."
      body="It may have been a sample result that wasn't saved. Plan it again and we'll flip the fare."
      actionHref="/plan"
      actionLabel="Plan a trip"
    />
  );
}
