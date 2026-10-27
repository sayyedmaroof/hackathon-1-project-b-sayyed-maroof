import Link from 'next/link'
import { ShellLayout } from '@/components/shell-layout'
import { getTotalSaved, getUserBookings } from '@/app/actions/booking'
import { getCurrentUser } from '@/lib/auth/current-user'
import { formatEuro } from '@/lib/savings'
import { redirect } from 'next/navigation'

export default async function BookingsPage() {
  const user = await getCurrentUser()
  if (!user?.emailVerifiedAt) redirect('/login?next=/bookings')

  const rows = await getUserBookings(user.id)
  const totalSaved = await getTotalSaved(user.id)

  return (
    <ShellLayout user={user}>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-.06em]">Your bookings</h1>
          <p className="mt-2 text-sm text-[#76675c]">Cash and award trips you confirmed here.</p>
        </div>
        <p className="text-lg font-semibold text-[#b86632]">Total saved {formatEuro(totalSaved)}</p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {rows.length === 0 ? (
          <article className="panel">
            <h2 className="text-xl font-semibold">No bookings yet</h2>
            <p className="mt-2 text-sm text-[#76675c]">Search for a flight and book the best option to see it here.</p>
            <Link href="/search" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#b86632]">
              Search flights
            </Link>
          </article>
        ) : (
          rows.map((row) => (
            <Link key={row.id} href={`/bookings/${row.id}`} className="panel block hover:border-[#b86632]">
              <p className="font-semibold">
                {row.origin} → {row.destination}
              </p>
              <p className="mt-1 text-sm text-[#76675c]">
                {row.departDate} · {row.cabin} · {row.provider === 'duffel' ? 'Cash (Duffel test)' : 'Award guide'}
              </p>
              <p className="mt-2 text-sm text-[#b86632]">Saved {formatEuro(Number(row.savingEur))}</p>
            </Link>
          ))
        )}
      </div>
    </ShellLayout>
  )
}
