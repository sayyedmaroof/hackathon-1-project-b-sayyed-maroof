export const siteConfig = {
  name: "Fareflip",
  tagline: "Flip the fare.",
  descriptor:
    "Smarter routes, points and dates that turn the normal price into a much lower one.",
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
