"use client";

import { useEffect, useState } from "react";
import { serializeTripQuery } from "@/lib/query";
import type { Option, TripQuery } from "@/lib/types";

const HACK_COUNT = 6;

/** Reads the search stream. Components receive options, not fetch details. */
export function useTripSearch(query: TripQuery | null) {
  const [options, setOptions] = useState<Option[]>([]);
  const [checked, setChecked] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = query ? serializeTripQuery(query) : "";
  const [seenKey, setSeenKey] = useState(key);

  if (key !== seenKey) {
    setSeenKey(key);
    setOptions([]);
    setChecked(0);
    setDone(false);
    setError(null);
  }

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();

    const run = async () => {
      const response = await fetch(`/api/search?${key}`, { signal: controller.signal });
      if (!response.ok || !response.body) {
        throw new Error("Search failed");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done: finished } = await reader.read();
        if (finished) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const option = JSON.parse(line) as Option;
          setOptions((current) => [...current, option]);
          setChecked((current) => current + 1);
        }
      }
      setDone(true);
    };

    run().catch((caught: unknown) => {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError("We couldn't finish checking the hacks. Try the search again.");
      setDone(true);
    });

    return () => controller.abort();
  }, [key]);

  return { options, checked, total: HACK_COUNT, done, error };
}
