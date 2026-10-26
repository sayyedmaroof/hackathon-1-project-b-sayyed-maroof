import type { Metadata } from "next";
import { TripsBoard } from "@/components/trips/trips-board";

export const metadata: Metadata = {
  title: "Saved trips",
  description: "Trips you kept, and the total you would have saved.",
};

export default function TripsPage() {
  return <TripsBoard />;
}
