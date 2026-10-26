/** Shared domain types. UI components depend on these, never on mock modules. */

export type Hack =
  | "flexible-dates"
  | "nearby-airports"
  | "split-ticket"
  | "stopover"
  | "miles"
  | "transfer-partner";

export type Risk = "low" | "medium" | "high";

export type Cabin = "economy" | "premium" | "business";

export type TripMode = "quick" | "full";

export type CurrencyCode = "EUR" | "GBP" | "USD";

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
  /** City cluster used for nearby-airport hints, e.g. "Madrid". */
  cluster: string;
  /** Horizontal position on the schematic Europe map, 0–100. */
  x: number;
  /** Vertical position on the schematic Europe map, 0–100. */
  y: number;
}

export interface Leg {
  id: string;
  from: string;
  to: string;
  depart: string;
  returnDate?: string;
}

export interface ProgramBalance {
  programId: string;
  balance: number;
}

export interface TripQuery {
  mode: TripMode;
  legs: Leg[];
  travellers: number;
  cabin: Cabin;
  flexDays: number;
  programs?: ProgramBalance[];
}

export interface Segment {
  from: string;
  to: string;
  departAt: string;
  arriveAt: string;
  carrier: string;
  flightNumber: string;
  durationMinutes: number;
  layoverMinutes?: number;
}

export type CostKind = "fare" | "bags" | "ground" | "taxes" | "points" | "surcharges" | "fees";

export interface CostLine {
  label: string;
  amount: number;
  kind: CostKind;
}

export interface CardSuggestion {
  name: string;
  pointsEarned: number;
  euroValue: number;
  reason: string;
}

export interface HeatCell {
  date: string;
  price: number;
}

export interface Option {
  id: string;
  hacks: Hack[];
  normalPrice: number;
  hackedPrice: number;
  saving: number;
  savingPct: number;
  extraMinutes: number;
  risk: Risk;
  whyItWorks: string;
  legs: Segment[];
  costBreakdown: CostLine[];
  /** Fixed ISO timestamp from the data source. Do not generate at render time. */
  pricedAt: string;
  origin: string;
  destination: string;
  durationMinutes: number;
  stops: number;
  bestCard: CardSuggestion;
  waitSignal: "book" | "wait";
  heatmap?: HeatCell[];
}

export interface HackMeta {
  slug: Hack;
  name: string;
  summary: string;
  why: string;
  difficulty: string;
  typicalSaving: string;
  risk: Risk;
  how: string[];
  when: string;
  risks: string[];
}

export interface SavedTrip {
  id: string;
  savedAt: string;
  alert: boolean;
  snapshot: Option;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  kind: "bank" | "airline" | "hotel";
  balance: number;
  expiry: string;
  euroValue: number;
  /** Points required for the sample next trip. */
  nextTripCost: number;
  unit: string;
}

export interface TransferLink {
  fromId: string;
  toId: string;
  ratio: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  name: string;
  route: string;
  quote: string;
  saving: number;
  /** Sample copy. Not a real customer. */
  sample: true;
}

export interface Stat {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /** Sample figure, not a live metric. */
  sample: true;
}

export interface TickerItem {
  id: string;
  route: string;
  saving: number;
  /** Sample ticker line. */
  sample: true;
}

export interface HowStep {
  id: string;
  title: string;
  body: string;
}

export interface Preferences {
  currency: CurrencyCode;
  homeAirport: string;
  timeValue: number;
  name: string;
  email: string;
  alerts: boolean;
  productUpdates: boolean;
}
