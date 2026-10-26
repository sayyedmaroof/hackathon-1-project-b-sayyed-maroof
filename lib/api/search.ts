import { buildOptions } from "@/lib/mock/options";
import type { Option, TripQuery } from "@/lib/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Stream hacked-fare options for a trip.
 * This is the only function a real search API needs to replace.
 */
export async function* searchTrips(query: TripQuery): AsyncIterable<Option> {
  const options = buildOptions(query);
  for (const option of options) {
    await delay(280);
    yield option;
  }
}
