import type { AwardOption, WidgetPart } from "@/lib/agent/widgets";

const sampleSource = [{ label: "Invented sample", lastVerified: "2026-10-26" }];

function award(partial: Omit<AwardOption, "sample" | "sources" | "surcharges" | "cardFees"> & {
  surcharges?: number;
  cardFees?: number;
}): AwardOption {
  return {
    surcharges: 0,
    cardFees: 0,
    sample: true,
    sources: sampleSource,
    ...partial,
  };
}

export const jnbAwards: AwardOption[] = [
  award({
    id: "mad-jnb-iberia",
    origin: "Madrid",
    destination: "Johannesburgo",
    originCode: "MAD",
    destinationCode: "JNB",
    depart: "2027-01-20",
    returnDate: "2027-02-03",
    cabin: "business",
    program: "Iberia Club",
    points: 85000,
    taxes: 214,
    surcharges: 98,
    seats: 2,
    cashPrice: 2140,
    verifiedMinutesAgo: 12,
    risk: "low",
    why: "Un premio saver en Iberia cubre la cabina. Pagas tasas e impuestos, no el billete de 2.140 €.",
  }),
  award({
    id: "mad-jnb-ba",
    origin: "Madrid",
    destination: "Johannesburgo",
    originCode: "MAD",
    destinationCode: "JNB",
    depart: "2027-01-22",
    returnDate: "2027-02-04",
    cabin: "business",
    program: "British Airways Club",
    points: 90000,
    taxes: 260,
    surcharges: 168,
    seats: 1,
    cashPrice: 2380,
    verifiedMinutesAgo: 18,
    risk: "medium",
    why: "BA tiene plaza, pero el recargo del premio es más alto. Sigue mereciendo la pena frente al efectivo.",
  }),
  award({
    id: "mad-jnb-qatar",
    origin: "Madrid",
    destination: "Johannesburgo",
    originCode: "MAD",
    destinationCode: "JNB",
    depart: "2027-01-18",
    returnDate: "2027-02-02",
    cabin: "business",
    program: "Qatar Airways Privilege Club",
    points: 78000,
    taxes: 190,
    surcharges: 210,
    seats: 2,
    cashPrice: 2210,
    verifiedMinutesAgo: 25,
    risk: "high",
    why: "Menos Avios, más tasas. Solo compensa si ya tienes la cuenta de Qatar vinculada.",
  }),
];

export const balanceAwards: AwardOption[] = [
  award({
    id: "mad-lis-economy",
    origin: "Madrid",
    destination: "Lisboa",
    originCode: "MAD",
    destinationCode: "LIS",
    depart: "2026-12-04",
    returnDate: "2026-12-07",
    cabin: "economy",
    program: "Iberia Club",
    points: 18500,
    taxes: 64,
    seats: 4,
    cashPrice: 210,
    verifiedMinutesAgo: 9,
    risk: "low",
    why: "Cabe en 40.000 Avios y deja margen. El efectivo no es caro, pero el premio sí es limpio.",
  }),
  award({
    id: "mad-fco-business",
    origin: "Madrid",
    destination: "Roma",
    originCode: "MAD",
    destinationCode: "FCO",
    depart: "2026-12-11",
    returnDate: "2026-12-15",
    cabin: "business",
    program: "Iberia Club",
    points: 52000,
    taxes: 112,
    seats: 1,
    cashPrice: 640,
    verifiedMinutesAgo: 14,
    risk: "medium",
    why: "Te faltan 12.000 Avios. No compres ni transfieras hasta fijar esta plaza.",
  }),
];

export const nowAwards: AwardOption[] = [
  award({
    id: "mad-bcn-now",
    origin: "Madrid",
    destination: "Barcelona",
    originCode: "MAD",
    destinationCode: "BCN",
    depart: "2026-10-30",
    cabin: "economy",
    program: "Vueling Club",
    points: 15000,
    taxes: 42,
    seats: 3,
    cashPrice: 49,
    verifiedMinutesAgo: 6,
    risk: "low",
    why: "El efectivo ya es barato. Gastar 15.000 Avios aquí es mal negocio.",
  }),
  award({
    id: "mad-lis-now",
    origin: "Madrid",
    destination: "Lisboa",
    originCode: "MAD",
    destinationCode: "LIS",
    depart: "2026-11-02",
    cabin: "economy",
    program: "Iberia Club",
    points: 22000,
    taxes: 71,
    seats: 2,
    cashPrice: 89,
    verifiedMinutesAgo: 8,
    risk: "low",
    why: "Puntos más tasas se acercan al precio de caja. Aquí compensa pagar en efectivo.",
  }),
];

export function availabilityCells(base: number) {
  return Array.from({ length: 28 }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    const wave = [1, 0.9, 1.2, 0.8, 1.4, 1.1, 0.95][index % 7]!;
    return {
      date: `2027-01-${day}`,
      cabin: "business",
      points: Math.round(base * wave),
    };
  });
}

export const jnbStrategy: Extract<WidgetPart, { type: "strategy" }> = {
  type: "strategy",
  data: {
    goal: "Business a Sudáfrica en unos 90 días",
    programs: ["Iberia Club", "British Airways Club"],
    earnMethod: "Gasto que ya haces, más un plan de Revolut solo si el número sale",
    route: "Madrid → Johannesburgo",
    nextStep: "Comprobar disponibilidad y no mover Avios hasta ver la plaza",
    reminders: [
      "Acumula con el gasto que ya ibas a hacer.",
      "No pidas crédito ni pagues intereses por puntos.",
      "Transfiere solo cuando la plaza esté a la vista.",
    ],
  },
};
