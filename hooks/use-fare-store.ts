"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { AgentMode } from "@/lib/agent/events";
import type { StrategyData, WidgetPart } from "@/lib/agent/widgets";
import { planById, type PlanId } from "@/lib/plans";

const KEY = "fareflip:v2";
const EVENT = "fareflip-v2";

export type BoardStatus = "idea" | "researching" | "ready" | "booked";

export type BoardItem = {
  id: string;
  optionId: string;
  route: string;
  cabin: string;
  points: number;
  taxes: number;
  cashPrice: number;
  owned: number;
  status: BoardStatus;
  mode: AgentMode;
};

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  due: string;
};

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
  createdAt: string;
};

export type MessagePart =
  | { type: "text"; text: string }
  | { type: "tools"; items: { id: string; label: string; done: boolean; ok: boolean }[] }
  | { type: "widget"; widget: WidgetPart }
  | { type: "error"; retryable: boolean };

export type Conversation = {
  id: string;
  title: string;
  mode: AgentMode;
  messages: StoredMessage[];
  suggestions: string[];
  availabilityConfirmed: boolean;
  updatedAt: string;
};

export type WalletProgram = {
  id: string;
  name: string;
  balance: number;
  expiry: string;
  euroValue: number;
  unit: string;
  link: "linked" | "open" | "wait";
};

type Store = {
  version: 2;
  planId: PlanId;
  billing: "monthly" | "annual";
  usageMonth: string;
  searches: number;
  mode: AgentMode;
  conversations: Conversation[];
  strategy: StrategyData | null;
  board: BoardItem[];
  checklist: ChecklistItem[];
  wallet: WalletProgram[];
  settings: {
    name: string;
    email: string;
    homeAirport: string;
    alerts: boolean;
    productUpdates: boolean;
  };
};

const defaultChecklist: ChecklistItem[] = [
  { id: "iberia", label: "Open an Iberia Club account", done: false, due: "2026-11-15" },
  { id: "link", label: "Link BA and Qatar", done: false, due: "2026-12-01" },
  { id: "check", label: "Check availability", done: false, due: "2027-01-10" },
  { id: "move", label: "Transfer Avios", done: false, due: "2027-01-18" },
];

const defaultWallet: WalletProgram[] = [
  { id: "ba", name: "British Airways Club", balance: 40000, expiry: "2027-06-01", euroValue: 480, unit: "Avios", link: "linked" },
  { id: "iberia", name: "Iberia Club", balance: 12000, expiry: "2027-03-01", euroValue: 144, unit: "Avios", link: "open" },
  { id: "vueling", name: "Vueling Club", balance: 0, expiry: "2027-01-01", euroValue: 0, unit: "Avios", link: "wait" },
  { id: "aerlingus", name: "Aer Lingus", balance: 0, expiry: "2027-01-01", euroValue: 0, unit: "Avios", link: "open" },
  { id: "finnair", name: "Finnair", balance: 0, expiry: "2027-01-01", euroValue: 0, unit: "Avios", link: "open" },
  { id: "qatar", name: "Qatar Airways Privilege Club", balance: 8000, expiry: "2026-12-31", euroValue: 96, unit: "Avios", link: "wait" },
];

function emptyStore(): Store {
  return {
    version: 2,
    planId: "free",
    billing: "monthly",
    usageMonth: "2026-10",
    searches: 18,
    mode: "plan",
    conversations: [],
    strategy: null,
    board: [],
    checklist: defaultChecklist,
    wallet: defaultWallet,
    settings: { name: "Marta", email: "", homeAirport: "MAD", alerts: false, productUpdates: false },
  };
}

function parse(raw: string): Store {
  if (!raw) return emptyStore();
  try {
    const value = JSON.parse(raw) as Partial<Store>;
    if (value.version !== 2) return emptyStore();
    return { ...emptyStore(), ...value };
  } catch {
    return emptyStore();
  }
}

function read() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY) ?? "";
}

export function readFareStore() {
  return parse(read());
}

function write(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onStoreChange: () => void) {
  const notify = () => onStoreChange();
  window.addEventListener("storage", notify);
  window.addEventListener(EVENT, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(EVENT, notify);
  };
}

export function useFareStore() {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  const store = parse(raw);

  const update = useCallback((recipe: (current: Store) => Store) => {
    write(recipe(parse(read())));
  }, []);

  return {
    store,
    plan: planById(store.planId),
    update,
    setMode: (mode: AgentMode) => update((current) => ({ ...current, mode })),
    setPlan: (planId: PlanId) => update((current) => ({ ...current, planId })),
    setBilling: (billing: Store["billing"]) => update((current) => ({ ...current, billing })),
    patchSettings: (partial: Partial<Store["settings"]>) =>
      update((current) => ({ ...current, settings: { ...current.settings, ...partial } })),
    setWalletBalance: (id: string, balance: number) =>
      update((current) => ({
        ...current,
        wallet: current.wallet.map((program) =>
          program.id === id ? { ...program, balance, euroValue: Math.round(balance * 0.012) } : program,
        ),
      })),
  };
}
