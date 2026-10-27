'use server'

import { eq, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { bookings } from '@/lib/db/schema'
import { bookCashSchema, markAwardBookedSchema } from '@/lib/auth/schemas'
import { requireVerifiedUser } from '@/lib/auth/session'
import { createDuffelOrder } from '@/lib/providers/duffel'
import { effectiveCost } from '@/lib/savings'

function savingEur(normalPrice: number, paid: number): string {
  return String(Math.max(0, Math.round(normalPrice - paid)))
}

export async function bookCashOffer(_prev: unknown, formData: FormData) {
  const user = await requireVerifiedUser().catch(() => null)
  if (!user) redirect(`/login?next=${encodeURIComponent(formData.get('next')?.toString() ?? '/results')}`)

  const passengersRaw = formData.get('passengers')
  let passengers: unknown[] = []
  try {
    passengers = JSON.parse(typeof passengersRaw === 'string' ? passengersRaw : '[]')
  } catch {
    return { error: 'Invalid passenger data' }
  }

  const parsed = bookCashSchema.safeParse({
    offerId: formData.get('offerId'),
    normalPrice: formData.get('normalPrice'),
    origin: formData.get('origin'),
    destination: formData.get('destination'),
    departDate: formData.get('departDate'),
    returnDate: formData.get('returnDate'),
    cabin: formData.get('cabin'),
    cashPrice: formData.get('cashPrice'),
    passengers,
  })
  if (!parsed.success) return { error: 'Check passenger details and try again.' }

  const data = parsed.data
  let order: { orderId: string; bookingRef: string }
  try {
    order = await createDuffelOrder({
      offerId: data.offerId,
      passengers: data.passengers,
    })
  } catch {
    return { error: 'Could not complete the test booking with Duffel.' }
  }

  const paid = data.cashPrice
  const inserted = await db
    .insert(bookings)
    .values({
      userId: user.id,
      provider: 'duffel',
      providerRef: order.bookingRef,
      origin: data.origin,
      destination: data.destination,
      departDate: data.departDate,
      returnDate: data.returnDate,
      cabin: data.cabin,
      cashPrice: String(data.cashPrice),
      savingEur: savingEur(data.normalPrice, paid),
      status: 'confirmed',
      passengers: data.passengers,
    })
    .returning({ id: bookings.id })

  redirect(`/bookings/${inserted[0]!.id}`)
}

export async function markAwardBooked(_prev: unknown, formData: FormData) {
  const user = await requireVerifiedUser().catch(() => null)
  if (!user) redirect(`/login?next=${encodeURIComponent(formData.get('next')?.toString() ?? '/results')}`)

  const passengersRaw = formData.get('passengers')
  let passengers: unknown[] = [{}]
  try {
    passengers = JSON.parse(typeof passengersRaw === 'string' ? passengersRaw : '[{}]')
  } catch {
    passengers = [{}]
  }

  const parsed = markAwardBookedSchema.safeParse({
    offerKey: formData.get('offerKey'),
    normalPrice: formData.get('normalPrice'),
    origin: formData.get('origin'),
    destination: formData.get('destination'),
    departDate: formData.get('departDate'),
    returnDate: formData.get('returnDate'),
    cabin: formData.get('cabin'),
    cashPrice: formData.get('cashPrice'),
    awardPoints: formData.get('awardPoints'),
    awardFees: formData.get('awardFees'),
    passengers,
  })
  if (!parsed.success) return { error: 'Invalid booking data.' }

  const data = parsed.data
  const paid = effectiveCost(data.cashPrice, data.awardFees, data.awardPoints)
  const inserted = await db
    .insert(bookings)
    .values({
      userId: user.id,
      provider: 'award_guide',
      providerRef: data.offerKey,
      origin: data.origin,
      destination: data.destination,
      departDate: data.departDate,
      returnDate: data.returnDate,
      cabin: data.cabin,
      cashPrice: String(data.cashPrice),
      awardPoints: String(data.awardPoints),
      awardFees: String(data.awardFees),
      savingEur: savingEur(data.normalPrice, paid),
      status: 'confirmed',
      passengers: data.passengers,
    })
    .returning({ id: bookings.id })

  redirect(`/bookings/${inserted[0]!.id}`)
}

export async function getUserBookings(userId: string) {
  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(sql`${bookings.createdAt} desc`)
}

export async function getTotalSaved(userId: string): Promise<number> {
  const rows = await db
    .select({ total: sql<string>`coalesce(sum(${bookings.savingEur}), 0)` })
    .from(bookings)
    .where(eq(bookings.userId, userId))
  return Number.parseFloat(rows[0]?.total ?? '0') || 0
}
