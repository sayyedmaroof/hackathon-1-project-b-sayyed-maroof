"use client";

import { useTranslations } from "next-intl";
import { AwardOptionCard } from "@/components/chat/widget-view";
import { TransferDiagram } from "@/components/wallet/transfer-diagram";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { balanceAwards, jnbAwards, nowAwards } from "@/lib/agent/fixtures";
import { useChat } from "@/hooks/use-chat";
import { useLocale } from "next-intl";

const awards = [...jnbAwards, ...balanceAwards, ...nowAwards];

export function TripAward({ id }: { id: string }) {
  const t = useTranslations("pages");
  const locale = useLocale();
  const chat = useChat(locale === "en" ? "en" : "es");
  const award = awards.find((item) => item.id === id) ?? awards[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AwardOptionCard option={award} onPin={(option) => chat.pinAward(option, "plan")} />
      <TransferDiagram />
      <Button render={<Link href="/chat" />}>{t("seeChat")}</Button>
    </div>
  );
}
