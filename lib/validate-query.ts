import type { TripQuery } from "@/lib/types";

export interface QueryErrors {
  form?: string;
  from?: string;
  to?: string;
  depart?: string;
  travellers?: string;
  legs?: Record<string, string>;
}

/** Friendly validation for the trip form. Empty object means the query is ready. */
export function validateTripQuery(query: TripQuery): QueryErrors {
  const errors: QueryErrors = {};

  if (query.travellers < 1 || query.travellers > 9) {
    errors.travellers = "Choose between 1 and 9 travellers.";
  }

  if (query.mode === "quick") {
    const leg = query.legs[0];
    if (!leg?.from) errors.from = "Choose a departure airport.";
    if (!leg?.to) errors.to = "Choose a destination airport.";
    if (leg?.from && leg.from === leg.to) {
      errors.to = "Destination needs to be a different airport.";
    }
    if (!leg?.depart) errors.depart = "Pick a departure date.";
    return errors;
  }

  if (query.legs.length === 0) {
    errors.form = "Add at least one stop.";
    return errors;
  }

  const legs: Record<string, string> = {};
  query.legs.forEach((leg, index) => {
    if (!leg.from || !leg.to) {
      legs[leg.id] = `Stop ${index + 1} needs a from and a to.`;
    } else if (leg.from === leg.to) {
      legs[leg.id] = `Stop ${index + 1} starts and ends in the same place.`;
    } else if (!leg.depart) {
      legs[leg.id] = `Stop ${index + 1} needs a date.`;
    }
  });

  if (Object.keys(legs).length > 0) errors.legs = legs;
  return errors;
}

export function hasQueryErrors(errors: QueryErrors) {
  return Object.keys(errors).length > 0;
}
