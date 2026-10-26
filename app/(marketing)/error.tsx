"use client";

import { useEffect } from "react";
import { StatusScreen } from "@/components/layout/status-screen";
import { Button } from "@/components/ui/button";

export default function MarketingError({
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
        eyebrow="Something slipped"
        title="The page didn't finish boarding."
        body="This is on us. Try again, and if it keeps happening, start a fresh search."
        actionHref="/"
        actionLabel="Go home"
      />
      <div className="mx-auto -mt-10 mb-16 w-full max-w-[1200px] px-5 md:px-8">
        <Button type="button" variant="outline" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
