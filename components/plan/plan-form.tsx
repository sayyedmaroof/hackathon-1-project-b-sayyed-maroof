"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useChat } from "@/hooks/use-chat";
import { useLocale } from "next-intl";

/** Classic form. It opens a chat whose first message is these values. */
export function PlanForm() {
  const t = useTranslations("pages");
  const router = useRouter();
  const locale = useLocale();
  const chat = useChat(locale === "en" ? "en" : "es");
  const [from, setFrom] = useState("MAD");
  const [to, setTo] = useState("JNB");
  const [date, setDate] = useState("2027-01-20");
  const [cabin, setCabin] = useState("business");

  return (
    <form
      className="mx-auto max-w-xl space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const text = `${from} ${to} ${date} ${cabin}`;
        const id = chat.start(text, "plan");
        router.push(`/chat/${id}`);
        void chat.send(id, text);
      }}
    >
      <h1 className="font-display text-4xl tracking-tight">{t("planFormTitle")}</h1>
      {([
        ["from", from, setFrom],
        ["to", to, setTo],
        ["dates", date, setDate],
        ["cabin", cabin, setCabin],
      ] as const).map(([key, value, set]) => (
        <label key={key} className="block text-sm">
          {t(key)}
          <input
            className="mt-1 h-11 w-full rounded-xl border border-line px-3"
            value={value}
            onChange={(event) => set(event.target.value)}
          />
        </label>
      ))}
      <Button type="submit">{t("seeChat")}</Button>
    </form>
  );
}
