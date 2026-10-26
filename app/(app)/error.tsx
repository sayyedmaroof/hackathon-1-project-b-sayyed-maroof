"use client";

import { useEffect } from "react";
import { StatusScreen } from "@/components/layout/status-screen";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <StatusScreen
        eyebrow="Search interrupted"
        title="We lost the thread on this page."
        body="Your saved trips are still on this device. Retry, or head back to the planner."
        actionHref="/plan"
        actionLabel="Back to plan"
      />
      <div className="mx-auto -mt-10 mb-16 w-full max-w-[1200px] px-5 md:px-8">
        <Button type="button" variant="outline" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
