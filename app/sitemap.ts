import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL ?? 'http://localhost:3000'
  return ['', '/plan', '/login', '/signup', '/privacy', '/terms'].map((path) => ({
    url: `${base}${path || '/'}`,
  }))
}
