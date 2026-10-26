/**
 * Travel photos from Pexels, free to use.
 * https://www.pexels.com/license/
 *
 * window — Michael Pointner
 * cape — Wade Whitear
 * city — Diego F. Parra
 * still — RDNE Stock project
 * cabin — Nikita Korchagin
 * beach — Francesco Ungaro
 * cards — RDNE Stock project, cards on a desk
 * card — RDNE Stock project, a card and its letter
 * wallet — Jakub Zerdzicki, a euro wallet
 */
export const photos = {
  window: {
    src: "/images/hero-window.jpg",
    width: 1600,
    height: 1067,
    alt: "Sunset coastline seen from an airplane window",
  },
  cape: {
    src: "/images/cape-town.jpg",
    width: 1600,
    height: 1066,
    alt: "Cape Town coastline and the Twelve Apostles",
  },
  city: {
    src: "/images/city-dusk.jpg",
    width: 1600,
    height: 1068,
    alt: "Terracotta rooftops in Dubrovnik at dusk",
  },
  still: {
    src: "/images/boarding-still.jpg",
    width: 1200,
    height: 800,
    alt: "A passport and boarding passes on a laptop",
  },
  cabin: {
    src: "/images/cabin.jpg",
    width: 1600,
    height: 1067,
    alt: "Empty airplane seats beside a bright window",
  },
  beach: {
    src: "/images/beach.jpg",
    width: 1600,
    height: 1067,
    alt: "Aerial view of a quiet beach and clear water",
  },
  cards: {
    src: "/images/cards.jpg",
    width: 1600,
    height: 1067,
    alt: "Credit cards fanned on a wooden desk",
  },
  card: {
    src: "/images/card.jpg",
    width: 1600,
    height: 1067,
    alt: "A black card beside its welcome letter",
  },
  wallet: {
    src: "/images/wallet.jpg",
    width: 1600,
    height: 1067,
    alt: "A leather wallet with euro notes",
  },
} as const;

export type PhotoId = keyof typeof photos;

/** Alternates the card with the trip it pays for. */
export const gallery: PhotoId[] = ["cards", "window", "wallet", "cape", "card", "city", "still", "beach"];
