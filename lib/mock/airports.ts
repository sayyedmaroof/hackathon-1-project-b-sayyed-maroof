import type { Airport } from "@/lib/types";

/** Real European airports, with city clusters for nearby-airport hints. */
export const airports: Airport[] = [
  { code: "MAD", city: "Madrid", name: "Adolfo Suárez Madrid–Barajas", country: "Spain", cluster: "Madrid", x: 28, y: 58 },
  { code: "BCN", city: "Barcelona", name: "Barcelona–El Prat", country: "Spain", cluster: "Barcelona", x: 40, y: 52 },
  { code: "GRO", city: "Girona", name: "Girona–Costa Brava", country: "Spain", cluster: "Barcelona", x: 42, y: 48 },
  { code: "REU", city: "Reus", name: "Reus", country: "Spain", cluster: "Barcelona", x: 38, y: 55 },
  { code: "LIS", city: "Lisbon", name: "Humberto Delgado", country: "Portugal", cluster: "Lisbon", x: 12, y: 62 },
  { code: "OPO", city: "Porto", name: "Francisco Sá Carneiro", country: "Portugal", cluster: "Porto", x: 14, y: 50 },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France", cluster: "Paris", x: 42, y: 32 },
  { code: "ORY", city: "Paris", name: "Orly", country: "France", cluster: "Paris", x: 41, y: 35 },
  { code: "BVA", city: "Paris", name: "Beauvais", country: "France", cluster: "Paris", x: 40, y: 30 },
  { code: "LHR", city: "London", name: "Heathrow", country: "United Kingdom", cluster: "London", x: 32, y: 26 },
  { code: "LGW", city: "London", name: "Gatwick", country: "United Kingdom", cluster: "London", x: 33, y: 29 },
  { code: "STN", city: "London", name: "Stansted", country: "United Kingdom", cluster: "London", x: 35, y: 24 },
  { code: "LTN", city: "London", name: "Luton", country: "United Kingdom", cluster: "London", x: 31, y: 24 },
  { code: "MXP", city: "Milan", name: "Malpensa", country: "Italy", cluster: "Milan", x: 52, y: 42 },
  { code: "LIN", city: "Milan", name: "Linate", country: "Italy", cluster: "Milan", x: 53, y: 44 },
  { code: "BGY", city: "Milan", name: "Bergamo", country: "Italy", cluster: "Milan", x: 54, y: 41 },
  { code: "FCO", city: "Rome", name: "Fiumicino", country: "Italy", cluster: "Rome", x: 58, y: 54 },
  { code: "CIA", city: "Rome", name: "Ciampino", country: "Italy", cluster: "Rome", x: 59, y: 55 },
  { code: "BER", city: "Berlin", name: "Brandenburg", country: "Germany", cluster: "Berlin", x: 56, y: 26 },
  { code: "AMS", city: "Amsterdam", name: "Schiphol", country: "Netherlands", cluster: "Amsterdam", x: 44, y: 24 },
  { code: "DUB", city: "Dublin", name: "Dublin", country: "Ireland", cluster: "Dublin", x: 20, y: 22 },
  { code: "VIE", city: "Vienna", name: "Vienna", country: "Austria", cluster: "Vienna", x: 64, y: 40 },
  { code: "PRG", city: "Prague", name: "Václav Havel", country: "Czechia", cluster: "Prague", x: 58, y: 32 },
  { code: "BRU", city: "Brussels", name: "Brussels", country: "Belgium", cluster: "Brussels", x: 42, y: 28 },
  { code: "CPH", city: "Copenhagen", name: "Kastrup", country: "Denmark", cluster: "Copenhagen", x: 54, y: 16 },
  { code: "ARN", city: "Stockholm", name: "Arlanda", country: "Sweden", cluster: "Stockholm", x: 62, y: 8 },
  { code: "ATH", city: "Athens", name: "Eleftherios Venizelos", country: "Greece", cluster: "Athens", x: 74, y: 66 },
  { code: "IST", city: "Istanbul", name: "Istanbul", country: "Türkiye", cluster: "Istanbul", x: 86, y: 52 },
];

export function airportByCode(code: string) {
  return airports.find((airport) => airport.code === code.toUpperCase());
}
