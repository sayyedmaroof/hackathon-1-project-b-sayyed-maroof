"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Preferences } from "@/lib/types";

const KEY = "fareflip:preferences";
const EVENT = "fareflip-preferences";

export const defaultPreferences: Preferences = {
  currency: "EUR",
  homeAirport: "MAD",
  timeValue: 25,
  name: "",
  email: "",
  alerts: true,
  productUpdates: false,
};

function parse(raw: string): Preferences {
  if (!raw) return defaultPreferences;
  try {
    return { ...defaultPreferences, ...(JSON.parse(raw) as Partial<Preferences>), currency: "EUR" };
  } catch {
    return defaultPreferences;
  }
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

/** Display preferences. Canonical prices stay in euros. */
export function usePreferences() {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY) ?? "",
    () => "",
  );
  const prefs = parse(raw);

  const update = useCallback((partial: Partial<Preferences>) => {
    const next = { ...parse(localStorage.getItem(KEY) ?? ""), ...partial };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { prefs, update, ready: true };
}
