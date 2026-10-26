export const siteConfig = {
  name: "Fareflip",
  tagline: "Dale la vuelta a la tarifa.",
  descriptor:
    "Un agente que te lleva de cero a un vuelo con puntos: acumular, buscar, mover y reservar.",
  url: "https://fareflip.example",
  links: {
    how: "/#how-it-works",
    hacks: "/hacks",
    points: "/#points",
    start: "/plan",
    results: "/results",
    trips: "/trips",
    wallet: "/wallet",
    settings: "/settings",
    login: "/login",
    signup: "/signup",
  },
} as const;

export type SiteConfig = typeof siteConfig;
