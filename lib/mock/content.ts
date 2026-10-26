import type { FaqItem, HowStep, Stat, Testimonial, TickerItem } from "@/lib/types";

/** SAMPLE STATS — illustrative, not measured. */
export const stats: Stat[] = [
  { id: "saved", value: 214, prefix: "€", label: "Average saved per trip", sample: true },
  { id: "hacks", value: 6, label: "Hacks checked on every search", sample: true },
  { id: "airports", value: 28, label: "Airports compared across Europe", sample: true },
];

/** SAMPLE TICKER — not a live feed. */
export const ticker: TickerItem[] = [
  { id: "t1", route: "Madrid → Lisbon", saving: 214, sample: true },
  { id: "t2", route: "Paris → Rome", saving: 186, sample: true },
  { id: "t3", route: "Berlin → Barcelona", saving: 240, sample: true },
  { id: "t4", route: "London → Milan", saving: 162, sample: true },
  { id: "t5", route: "Amsterdam → Athens", saving: 305, sample: true },
];

export const steps: HowStep[] = [
  {
    id: "enter",
    title: "Enter your trip",
    body: "One route, or a whole plan. Dates can flex. Airports can sit next door.",
  },
  {
    id: "find",
    title: "We find the hacks",
    body: "Six ways to lower the fare, each with the reason it works and the risk it adds.",
  },
  {
    id: "book",
    title: "You book it, or follow the steps",
    body: "A normal ticket, or a short guide when points and transfers are involved.",
  },
];

/** SAMPLE QUOTES — written for the preview, not real customers. */
export const testimonials: Testimonial[] = [
  {
    id: "ana",
    name: "Ana Ribeiro",
    route: "Lisbon → Rome",
    quote: "I moved the flight by one day and booked two tickets instead of one. The saving paid for the train home.",
    saving: 188,
    sample: true,
  },
  {
    id: "jonas",
    name: "Jonas Keller",
    route: "Berlin → Barcelona",
    quote: "I had points sitting on a card and no idea they could buy the seat. Fareflip showed the taxes, not a fantasy zero.",
    saving: 264,
    sample: true,
  },
  {
    id: "lea",
    name: "Léa Moreau",
    route: "Paris → Porto",
    quote: "Orly was €90 less than Charles de Gaulle, and the RER was already in the total. That is the number I wanted.",
    saving: 96,
    sample: true,
  },
];

export const faqs: FaqItem[] = [
  {
    question: "Is this legal?",
    answer:
      "Yes. These are published fares, award seats and airport choices. We do not invent prices or break airline rules. A split ticket is just two bookings.",
  },
  {
    question: "Do I need points?",
    answer:
      "No. Flexible dates, nearby airports, split tickets and stopovers work with cash. Points are one more option when you already have them.",
  },
  {
    question: "How do you make money?",
    answer:
      "In this preview, we don't. A later version can earn a fee when you book through a partner. The price we show stays the price you compare.",
  },
  {
    question: "How fresh are the prices?",
    answer:
      "Every result carries a timestamp. Sample figures in this preview are fixed so the screens stay stable. A live feed would refresh on each search.",
  },
  {
    question: "What is the true total?",
    answer:
      "Airfare plus bags, the train or bus to the airport you actually use, and taxes. A cheap fare that needs a €70 taxi is not cheap.",
  },
  {
    question: "What does the risk label mean?",
    answer:
      "Low means a normal booking with a small change. Medium means separate tickets or a longer day. High means points that move one way and a seat that can vanish.",
  },
  {
    question: "Can I save a trip and watch the price?",
    answer:
      "Yes. Saved trips stay on this device for now, with an alert you can turn on. The wait-or-book chip is a sample signal, not a guarantee.",
  },
  {
    question: "Which cities do you cover?",
    answer:
      "This preview searches a European set: Madrid, Barcelona, Lisbon, Paris, London, Milan, Rome, Berlin, Amsterdam and more, including the secondary airports.",
  },
];
