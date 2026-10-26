"use client";

import { useCallback, useSyncExternalStore } from "react";
import { toast } from "sonner";
import type { Option, SavedTrip } from "@/lib/types";

const KEY = "fareflip:saved-trips";
const EVENT = "fareflip-saved";

function parse(raw: string): SavedTrip[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedTrip[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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

function write(trips: SavedTrip[]) {
  localStorage.setItem(KEY, JSON.stringify(trips));
  window.dispatchEvent(new Event(EVENT));
}

/** Saved trips live on this device until an account exists. */
export function useSavedTrips() {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY) ?? "",
    () => "",
  );
  const trips = parse(raw);

  const save = useCallback((option: Option) => {
    const existing = parse(localStorage.getItem(KEY) ?? "");
    if (existing.some((trip) => trip.id === option.id)) {
      toast("This trip is already saved");
      return;
    }
    write([
      { id: option.id, savedAt: new Date().toISOString(), alert: false, snapshot: option },
      ...existing,
    ]);
    toast.success("Trip saved on this device");
  }, []);

  const remove = useCallback((id: string) => {
    write(parse(localStorage.getItem(KEY) ?? "").filter((trip) => trip.id !== id));
    toast("Trip removed");
  }, []);

  const toggleAlert = useCallback((id: string, alert: boolean) => {
    write(
      parse(localStorage.getItem(KEY) ?? "").map((trip) =>
        trip.id === id ? { ...trip, alert } : trip,
      ),
    );
    toast.success(alert ? "Price alert is on" : "Price alert is off");
  }, []);

  const totalSaved = trips.reduce((sum, trip) => sum + trip.snapshot.saving, 0);

  return {
    trips,
    ready: true,
    totalSaved,
    save,
    remove,
    toggleAlert,
    isSaved: (id: string) => trips.some((trip) => trip.id === id),
    find: (id: string) => trips.find((trip) => trip.id === id)?.snapshot ?? null,
  };
}
