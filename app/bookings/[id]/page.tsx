import Link from 'next/link'
import { eq, and } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { bookings } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth/current-user'
import { DataModeLabel, sandboxCopy } from '@/components/data-mode-label'
import type { DataMode } from '@/lib/providers/types'
import { formatEuro, formatMoney } from '@/lib/savings'

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
    <>
      <p className="eyebrow">Booking confirmed</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em]">
        {booking.origin} → {booking.destination}
      </h1>
      <p className="mt-2 text-sm text-[#76675c]">
        Reference <strong className="text-[#2a211b]">{booking.providerRef}</strong>
      </p>
      <dl className="panel mt-8 flex flex-col gap-3 text-sm">
        <Row
          label="Provider"
          value={
            booking.provider === 'duffel'
              ? booking.dataMode === 'live'
                ? 'Duffel'
                : 'Duffel (test)'
              : 'Award guide'
          }
        />
        <Row label="Depart" value={booking.departDate} />
        <Row label="Return" value={booking.returnDate} />
        <Row label="Cabin" value={booking.cabin} />
        <Row label="Cash reference price" value={formatMoney(Number(booking.cashPrice), booking.currency ?? 'EUR')} />
        <Row
          label={sandboxCopy((booking.dataMode as DataMode | null) ?? undefined) ? 'Sandbox difference' : 'You saved'}
          value={formatMoney(Number(booking.savingEur), booking.currency ?? 'EUR')}
          accent
        />
        <div className="pt-1">
          <DataModeLabel mode={(booking.dataMode as DataMode | null) ?? undefined} />
        </div>
      </dl>
      <Link href="/bookings" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[#b86632]">
        Back to bookings
      </Link>
    </>
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
