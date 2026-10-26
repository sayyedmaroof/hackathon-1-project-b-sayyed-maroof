"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { StatusScreen } from "@/components/layout/status-screen";
import { Button } from "@/components/ui/button";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <StatusScreen
        eyebrow={t("error")}
        title={t("errorTitle")}
        body={t("errorBody")}
        actionHref="/"
        actionLabel={t("home")}
      />
      <div className="mx-auto -mt-10 mb-16 w-full max-w-[1200px] px-5 md:px-8">
        <Button type="button" variant="outline" onClick={reset}>
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}
