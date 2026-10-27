import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-16">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-ink-muted">That URL is not part of FareFlip.</p>
      <Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary">
        Back home
      </Link>
    </div>
  )
}
