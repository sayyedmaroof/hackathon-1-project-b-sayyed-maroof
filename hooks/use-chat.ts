"use client";

import { useCallback, useRef, useState } from "react";
import type { AgentEvent, AgentMode } from "@/lib/agent/events";
import { runAgent } from "@/lib/agent/run-agent";
import type { AwardOption } from "@/lib/agent/widgets";
import { planById } from "@/lib/plans";
import {
  readFareStore,
  useFareStore,
  type Conversation,
  type MessagePart,
  type StoredMessage,
} from "@/hooks/use-fare-store";

function id() {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function apply(parts: MessagePart[], event: AgentEvent): MessagePart[] {
  if (event.type === "text-delta") {
    const next = [...parts];
    const last = next.at(-1);
    if (last?.type === "text") next[next.length - 1] = { type: "text", text: last.text + event.text };
    else next.push({ type: "text", text: event.text });
    return next;
  }
  if (event.type === "tool-start") {
    const next = [...parts];
    const index = next.findIndex((part) => part.type === "tools");
    const item = { id: event.toolId, label: event.label, done: false, ok: false };
    if (index === -1) next.push({ type: "tools", items: [item] });
    else {
      const tools = next[index];
      if (tools?.type === "tools") next[index] = { type: "tools", items: [...tools.items, item] };
    }
    return next;
  }
  if (event.type === "tool-end") {
    return parts.map((part) =>
      part.type === "tools"
        ? {
            type: "tools",
            items: part.items.map((item) =>
              item.id === event.toolId ? { ...item, done: true, ok: event.ok } : item,
            ),
          }
        : part,
    );
  }
  if (event.type === "widget") return [...parts, { type: "widget", widget: event.widget }];
  if (event.type === "error") return [...parts, { type: "error", retryable: event.retryable }];
  return parts;
}

export function useChat(locale: "es" | "en") {
  const fare = useFareStore();
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [liveParts, setLiveParts] = useState<MessagePart[] | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const persist = useCallback(
    (conversation: Conversation) => {
      fare.update((current) => {
        const rest = current.conversations.filter((item) => item.id !== conversation.id);
        return { ...current, conversations: [conversation, ...rest] };
      });
    },
    [fare],
  );

  const consume = useCallback(
    async (conversation: Conversation, mode: AgentMode) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const assistantId = id();
      setStreamingId(conversation.id);
      let parts: MessagePart[] = [];
      setLiveParts(parts);
      let suggestions = conversation.suggestions;
      try {
        const stream = runAgent({
          conversationId: conversation.id,
          mode,
          locale,
          usage: { used: fare.store.searches, limit: fare.plan.searches },
          messages: conversation.messages
            .filter((message) => message.role === "user" || message.parts.some((part) => part.type === "text"))
            .map((message) => ({
              role: message.role,
              text: message.parts
                .filter((part) => part.type === "text")
                .map((part) => (part.type === "text" ? part.text : ""))
                .join(" "),
            })),
        });
        for await (const event of stream) {
          if (controller.signal.aborted) break;
          if (event.type === "suggestions") suggestions = event.items;
          if (event.type === "tool-start" && event.tool === "searchAwards") {
            fare.update((current) => ({ ...current, searches: current.searches + 1 }));
          }
          if (event.type === "widget" && event.widget.type === "strategy") {
            fare.update((current) => ({ ...current, strategy: event.widget.type === "strategy" ? event.widget.data : current.strategy }));
          }
          parts = apply(parts, event);
          setLiveParts([...parts]);
          if (event.type === "done" || event.type === "error") break;
        }
      } catch {
        parts = [...parts, { type: "error", retryable: true }];
      }
      const assistant: StoredMessage = {
        id: assistantId,
        role: "assistant",
        parts,
        createdAt: new Date().toISOString(),
      };
      persist({
        ...conversation,
        messages: [...conversation.messages, assistant],
        suggestions,
        updatedAt: new Date().toISOString(),
      });
      setLiveParts(null);
      setStreamingId(null);
    },
    [fare, locale, persist],
  );

  const send = useCallback(
    async (conversationId: string, text: string) => {
      const existing = readFareStore().conversations.find((item) => item.id === conversationId);
      if (!existing) return;
      const user: StoredMessage = {
        id: id(),
        role: "user",
        parts: [{ type: "text", text }],
        createdAt: new Date().toISOString(),
      };
      const next = {
        ...existing,
        title: existing.messages.length === 0 ? text.slice(0, 64) : existing.title,
        messages: [...existing.messages, user],
        updatedAt: new Date().toISOString(),
      };
      persist(next);
      await consume(next, next.mode);
    },
    [consume, persist],
  );

  const start = useCallback(
    (text: string, mode: AgentMode = fare.store.mode) => {
      const conversation: Conversation = {
        id: id(),
        title: text.slice(0, 64),
        mode,
        messages: [],
        suggestions: [],
        availabilityConfirmed: false,
        updatedAt: new Date().toISOString(),
      };
      persist(conversation);
      return conversation.id;
    },
    [fare.store.mode, persist],
  );

  const confirmAction = useCallback(
    (action: "transfer" | "buy" | "alert" | "upgrade") => {
      if (action !== "transfer" && action !== "buy") return;
      fare.update((current) => ({
        ...current,
        checklist: current.checklist.map((item) =>
          item.id === "move" ? { ...item, done: true } : item,
        ),
      }));
    },
    [fare],
  );

  const confirmAvailability = useCallback(
    (conversationId: string) => {
      fare.update((current) => ({
        ...current,
        conversations: current.conversations.map((item) =>
          item.id === conversationId ? { ...item, availabilityConfirmed: true } : item,
        ),
        checklist: current.checklist.map((item) =>
          item.id === "check" ? { ...item, done: true } : item,
        ),
      }));
    },
    [fare],
  );

  const pinAward = useCallback(
    (option: AwardOption, mode: AgentMode) => {
      fare.update((current) => {
        if (current.board.some((item) => item.optionId === option.id)) return current;
        if (current.board.length >= planById(current.planId).saved) return current;
        const owned = current.wallet.reduce((sum, program) => sum + program.balance, 0);
        return {
          ...current,
          board: [
            {
              id: option.id,
              optionId: option.id,
              route: `${option.origin} → ${option.destination}`,
              cabin: option.cabin,
              points: option.points,
              taxes: option.taxes + option.surcharges + option.cardFees,
              cashPrice: option.cashPrice,
              owned,
              status: "researching",
              mode,
            },
            ...current.board,
          ],
        };
      });
    },
    [fare],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  return {
    conversations: fare.store.conversations,
    streamingId,
    liveParts,
    send,
    start,
    stop,
    confirmAvailability,
    confirmAction,
    pinAward,
    streaming: streamingId !== null,
  };
}
