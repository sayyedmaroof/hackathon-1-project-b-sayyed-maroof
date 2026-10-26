export const siteConfig = {
  name: "Fareflip",
  tagline: "Turn the fare around.",
  descriptor:
    "An agent that takes you from zero to a flight on points: earn, search, move, and book.",
  url: "https://fareflip.example",
  links: {
    hacks: "/hacks",
    start: "/chat",
    results: "/chat",
    trips: "/trips",
    wallet: "/wallet",
    settings: "/settings",
    login: "/login",
    signup: "/signup",
  },
} as const;

export type SiteConfig = typeof siteConfig;
