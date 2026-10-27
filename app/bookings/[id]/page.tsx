import Link from 'next/link'
import { eq, and } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { ShellLayout } from '@/components/shell-layout'
import { db } from '@/lib/db'
import { bookings } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth/current-user'
import { formatEuro } from '@/lib/savings'

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user?.emailVerifiedAt) redirect('/login?next=/bookings')

  const { id } = await params
  const rows = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.userId, user.id)))
    .limit(1)
  const booking = rows[0]
  if (!booking) notFound()

  return (
    <ShellLayout user={user}>
      <p className="eyebrow">Booking confirmed</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em]">
        {booking.origin} → {booking.destination}
      </h1>
      <p className="mt-2 text-sm text-[#76675c]">
        Reference <strong className="text-[#2a211b]">{booking.providerRef}</strong>
      </p>
      <dl className="panel mt-8 flex flex-col gap-3 text-sm">
        <Row label="Provider" value={booking.provider === 'duffel' ? 'Duffel (test)' : 'Award guide'} />
        <Row label="Depart" value={booking.departDate} />
        <Row label="Return" value={booking.returnDate} />
        <Row label="Cabin" value={booking.cabin} />
        <Row label="Cash reference price" value={formatEuro(Number(booking.cashPrice))} />
        <Row label="You saved" value={formatEuro(Number(booking.savingEur))} accent />
      </dl>
      <Link href="/bookings" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[#b86632]">
        Back to bookings
      </Link>
    </ShellLayout>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#76675c]">{label}</dt>
      <dd className={accent ? 'font-semibold text-[#b86632]' : ''}>{value}</dd>
    </div>
  )
}
