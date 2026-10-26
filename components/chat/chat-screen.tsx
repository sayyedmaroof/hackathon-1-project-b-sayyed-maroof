"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { WidgetView } from "@/components/chat/widget-view";
import { SkeletonResult } from "@/components/fare/skeleton-result";
import { Logo } from "@/components/brand/logo";
import { ScreenshotDropzone } from "@/components/search/screenshot-dropzone";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useChat } from "@/hooks/use-chat";
import { useFareStore, type Conversation, type MessagePart } from "@/hooks/use-fare-store";
import type { AwardOption, WidgetPart } from "@/lib/agent/widgets";
import { usageLevel } from "@/lib/agent/gates";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "cn";

function hasAvailability(parts: MessagePart[]) {
  return parts.some((part) => part.type === "widget" && part.widget.type === "availability");
}

function MessageParts({
  parts,
  availabilityShown,
  availabilityConfirmed,
  onConfirm,
  onPin,
  onRetry,
  onConfirmAction,
}: {
  parts: MessagePart[];
  availabilityShown: boolean;
  availabilityConfirmed: boolean;
  onConfirm: () => void;
  onPin: (option: AwardOption) => void;
  onRetry: () => void;
  onConfirmAction: (action: "transfer" | "buy" | "alert" | "upgrade") => void;
}) {
  const common = useTranslations("common");
  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.type === "text") return <p key={index} className="text-sm leading-relaxed">{part.text}</p>;
        if (part.type === "tools") {
          const running = part.items.some((item) => !item.done);
          return (
            <div key={index} className="space-y-2">
              {running ? <SkeletonResult /> : null}
              <ul className="space-y-1 text-sm text-ink-muted">
                {part.items.map((item) => (
                  <li key={item.id}>
                    {item.done ? "✓" : "…"} {item.label}
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        if (part.type === "error") {
          return (
            <div key={index}>
              <p className="text-sm text-risk">{common("error")}</p>
              {part.retryable ? (
                <Button type="button" variant="outline" className="mt-2" onClick={onRetry}>
                  {common("retry")}
                </Button>
              ) : null}
            </div>
          );
        }
        return (
          <WidgetView
            key={index}
            widget={part.widget}
            availabilityShown={availabilityShown}
            availabilityConfirmed={availabilityConfirmed}
            onConfirmAvailability={onConfirm}
            onConfirmAction={onConfirmAction}
            onPin={onPin}
          />
        );
      })}
    </div>
  );
}

export function ChatScreen({
  locale,
  conversationId,
}: {
  locale: "es" | "en";
  conversationId?: string;
}) {
  const t = useTranslations("chat");
  const common = useTranslations("common");
  const router = useRouter();
  const fare = useFareStore();
  const chat = useChat(locale);
  const conversation = chat.conversations.find((item) => item.id === conversationId);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [stick, setStick] = useState(true);
  const [attach, setAttach] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const level = usageLevel(fare.store.searches, fare.plan.searches);

  const messages = useMemo(() => {
    if (!conversation) return [];
    if (chat.streamingId === conversation.id && chat.liveParts) {
      return [
        ...conversation.messages,
        { id: "live", role: "assistant" as const, parts: chat.liveParts, createdAt: "" },
      ];
    }
    return conversation.messages;
  }, [chat.liveParts, chat.streamingId, conversation]);

  const availabilityShown = messages.some((message) => hasAvailability(message.parts));

  useEffect(() => {
    if (!stick) return;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, stick]);

  const go = async (text: string, mode = fare.store.mode) => {
    const id = conversation?.id ?? chat.start(text, mode);
    if (!conversation) router.push(`/chat/${id}`);
    await chat.send(id, text);
  };

  const filtered = chat.conversations.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
      <aside className="hidden min-h-0 flex-col border-r border-line lg:flex">
        <History
          title={t("history")}
          query={query}
          onQuery={setQuery}
          items={filtered}
          active={conversationId}
          onNew={() => router.push("/chat")}
        />
      </aside>
      <section className="flex min-h-0 flex-col">
        <div className="flex items-center px-3 pt-3 lg:hidden">
          <Drawer>
            <DrawerTrigger className="min-h-11 rounded-full border border-line px-3 text-sm">{t("history")}</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{t("history")}</DrawerTitle>
              </DrawerHeader>
              <History
                title={t("history")}
                query={query}
                onQuery={setQuery}
                items={filtered}
                active={conversationId}
                onNew={() => router.push("/chat")}
              />
            </DrawerContent>
          </Drawer>
        </div>
        <div
          ref={scroller}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
          aria-live="polite"
          onScroll={(event) => {
            const node = event.currentTarget;
            const near = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
            setStick(near);
          }}
        >
          {!conversation ? (
            <div className="mx-auto max-w-xl pt-10">
              <Logo />
              <h1 className="mt-6 font-display text-4xl tracking-tight md:text-5xl">{t("emptyTitle")}</h1>
              <p className="mt-3 text-ink-muted">{t("emptyBody")}</p>
            </div>
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[92%] md:max-w-[80%]",
                    message.role === "user"
                      ? "rounded-2xl bg-chat-user px-3 py-2 text-sm"
                      : "space-y-2",
                  )}
                >
                  {message.role === "assistant" ? (
                    <MessageParts
                      parts={message.parts}
                      availabilityShown={availabilityShown}
                      availabilityConfirmed={conversation.availabilityConfirmed}
                      onConfirm={() => chat.confirmAvailability(conversation.id)}
                      onConfirmAction={chat.confirmAction}
                      onPin={(option) => chat.pinAward(option, conversation.mode)}
                      onRetry={() => {
                        const last = [...conversation.messages].reverse().find((item) => item.role === "user");
                        const text = last?.parts.find((part) => part.type === "text");
                        if (text?.type === "text") void chat.send(conversation.id, text.text);
                      }}
                    />
                  ) : (
                    message.parts.map((part, index) =>
                      part.type === "text" ? <p key={index}>{part.text}</p> : null,
                    )
                  )}
                </div>
              </article>
            ))
          )}
        </div>
        {!stick ? (
          <button type="button" className="mx-auto mb-2 min-h-11 rounded-full border border-line px-3 text-sm" onClick={() => setStick(true)}>
            {t("newContent")}
          </button>
        ) : null}
        <form
          className="border-t border-line p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim() || chat.streaming) return;
            const text = draft;
            setDraft("");
            void go(text);
          }}
        >
          <div className="mb-2 flex gap-2">
            {(["plan", "now"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={cn(
                  "min-h-11 rounded-full border px-3 text-sm",
                  fare.store.mode === mode ? "border-ink bg-ink text-paper" : "border-line",
                )}
                onClick={() => fare.setMode(mode)}
              >
                {common(mode)}
              </button>
            ))}
          </div>
          {!conversation ? (
            <div className="mb-2 flex flex-wrap gap-2">
              {(t.raw("starters") as string[]).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="min-h-11 rounded-full border border-line px-3 text-left text-sm"
                  onClick={() => void go(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
          {conversation?.suggestions.length ? (
            <div className="mb-2 flex flex-wrap gap-2">
              {conversation.suggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="min-h-11 rounded-full border border-line px-3 text-sm"
                  onClick={() => void go(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
          {attach ? (
            <div className="mb-2 grid gap-2 md:grid-cols-2">
              <ScreenshotDropzone
                onDetected={() => {
                  setAttach(false);
                  void go(t("screenshotRead"));
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAttach(false);
                  void go(t("linkRead"));
                }}
              >
                {t("pasteLink")}
              </Button>
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <button type="button" className="min-h-11 min-w-11 rounded-xl border border-line" onClick={() => setAttach((open) => !open)} aria-label={t("attach")}>
              +
            </button>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              rows={2}
              placeholder={t("placeholder")}
              className="min-h-11 flex-1 resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm"
            />
            {chat.streaming ? (
              <Button type="button" variant="outline" onClick={chat.stop}>
                {common("stop")}
              </Button>
            ) : (
              <Button type="submit">{common("send")}</Button>
            )}
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            <Link href="/pricing" className={level === "blocked" ? "text-risk" : undefined}>
              {t("usage", { used: fare.store.searches, limit: fare.plan.searches })}
            </Link>
          </p>
        </form>
      </section>
      <BoardDrawer conversation={conversation} />
    </div>
  );
}

function History({
  title,
  query,
  onQuery,
  items,
  active,
  onNew,
}: {
  title: string;
  query: string;
  onQuery: (value: string) => void;
  items: Conversation[];
  active?: string;
  onNew: () => void;
}) {
  const t = useTranslations("chat");
  const common = useTranslations("common");
  return (
    <div className="flex min-h-0 flex-1 flex-col p-3">
      <Button type="button" onClick={onNew}>
        {common("newChat")}
      </Button>
      <label className="mt-3 text-xs text-ink-muted">
        {title}
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={t("searchHistory")}
          className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm"
        />
      </label>
      <ul className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/chat/${item.id}`}
              className={cn(
                "flex min-h-11 items-center rounded-xl px-2 text-sm",
                item.id === active && "bg-highlight",
              )}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BoardDrawer({ conversation }: { conversation?: Conversation }) {
  const t = useTranslations("common");
  const chatCopy = useTranslations("chat");
  const fare = useFareStore();
  const checklistLabel: Record<string, string> = {
    iberia: chatCopy("checkIberia"),
    link: chatCopy("checkLink"),
    check: chatCopy("checkSeat"),
    move: chatCopy("checkMove"),
  };
  const panel = (
    <div className="space-y-3 p-3">
      {fare.store.strategy ? (
        <article className="rounded-2xl border border-line bg-board p-3 text-sm">
          <p className="font-display text-xl">{fare.store.strategy.goal}</p>
          <p className="mt-1 text-ink-muted">{fare.store.strategy.nextStep}</p>
        </article>
      ) : null}
      {fare.store.board.map((item) => (
        <article key={item.id} className="rounded-2xl border border-line p-3 text-sm">
          <p className="font-medium">{item.route}</p>
          <p className="num text-ink-muted">
            {item.points} · {item.taxes} €
          </p>
          <p className="text-xs">{item.status}</p>
        </article>
      ))}
      <ul className="space-y-1 text-sm">
        {fare.store.checklist.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="min-h-11 text-left"
              onClick={() =>
                fare.update((current) => ({
                  ...current,
                  checklist: current.checklist.map((row) =>
                    row.id === item.id ? { ...row, done: !row.done } : row,
                  ),
                }))
              }
            >
              {item.done ? "✓" : "○"} {checklistLabel[item.id] ?? item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <>
      <aside className="hidden min-h-0 overflow-y-auto border-l border-line bg-board lg:block">{panel}</aside>
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-20 flex justify-center lg:hidden">
        <Drawer>
          <DrawerTrigger className="pointer-events-auto min-h-11 rounded-full border border-line bg-paper px-4 text-sm">
            {t("board")} ({fare.store.board.length})
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t("board")}</DrawerTitle>
            </DrawerHeader>
            {panel}
          </DrawerContent>
        </Drawer>
      </div>
      {conversation ? null : null}
    </>
  );
}

export type { WidgetPart };
