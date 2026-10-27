import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google'
import { AppShell } from '@/components/app-shell'
import { I18nProvider } from '@/components/i18n-provider'
import { getCurrentUser } from '@/lib/auth/current-user'
import './globals.css'

const sans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const serif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: {
    default: 'FareFlip — Spend first, then the trip',
    template: '%s · FareFlip',
  },
  description:
    'Guide existing card spend so points are ready before you fly. Compares against a current cash fare when available.',
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'FareFlip — Spend first, then the trip',
    description: 'A spend-planning guide for travellers in Spain.',
    type: 'website',
    images: [{ url: '/hero-travel.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FareFlip',
    description: 'A spend-planning guide for travellers in Spain.',
    images: ['/hero-travel.jpg'],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f7f2e9',
  colorScheme: 'light',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <noscript>FareFlip works without JavaScript for reading, but planning needs JavaScript enabled.</noscript>
        <I18nProvider>
          <AppShell user={user}>{children}</AppShell>
        </I18nProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
