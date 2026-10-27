'use server'

import { and, eq, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { reuseExistingBooking } from '@/lib/booking/idempotency'
import { computeSaving, offerExpired, priceChangedMessage, pricesEqual } from '@/lib/booking/price'
import { db } from '@/lib/db'
import { bookings } from '@/lib/db/schema'
import { bookCashSchema } from '@/lib/auth/schemas'
import { requireVerifiedUser } from '@/lib/auth/session'
import { assertLiveBookingAllowed, createDuffelOrder, getDuffelOffer } from '@/lib/providers/duffel'
import { DuffelError, userMessageForDuffel } from '@/lib/providers/duffel-errors'
import { getDuffelMode } from '@/lib/providers/duffel-client'
import { getOfferSnapshot } from '@/lib/search/offer-snapshot'

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
    acceptAmount: formData.get('acceptAmount') || undefined,
    acceptCurrency: formData.get('acceptCurrency') || undefined,
  })
  if (!parsed.success) return { error: 'Check passenger details and try again.' }

  const data = parsed.data
  try {
    assertLiveBookingAllowed()
  } catch {
    return { error: 'Live booking is disabled' }
  }

  const existingRows = await db
    .select({ id: bookings.id, status: bookings.status, providerRef: bookings.providerRef })
    .from(bookings)
    .where(and(eq(bookings.userId, user.id), eq(bookings.provider, 'duffel'), eq(bookings.offerId, data.offerId)))
    .limit(1)
  const existing = reuseExistingBooking(existingRows[0])
  if (existing?.status === 'confirmed') redirect(`/bookings/${existing.id}`)
  if (existing?.status === 'pending') return { error: 'This booking is already in progress.' }

  let fresh
  try {
    fresh = await getDuffelOffer(data.offerId)
  } catch (e) {
    if (e instanceof DuffelError) return { error: userMessageForDuffel(e) }
    return { error: 'Could not refresh this fare. Search again.' }
  }

  if (offerExpired(fresh.expiresAt)) {
    return { error: 'This offer expired or is no longer available. Search again for current fares.' }
  }
  if (fresh.passengerIds.length !== data.passengers.length) {
    return { error: 'Passenger count does not match this offer.' }
  }

  const snapshot = getOfferSnapshot(data.offerId)
  const accepted = data.acceptAmount && data.acceptCurrency
    ? pricesEqual({ amount: data.acceptAmount, currency: data.acceptCurrency }, { amount: fresh.totalAmount, currency: fresh.totalCurrency })
    : false
  const matchesSnapshot = snapshot
    ? pricesEqual({ amount: snapshot.amount, currency: snapshot.currency }, { amount: fresh.totalAmount, currency: fresh.totalCurrency })
    : false
  if (!matchesSnapshot && !accepted) {
    return {
      error: priceChangedMessage({ amount: fresh.totalAmount, currency: fresh.totalCurrency }),
      priceChanged: { amount: fresh.totalAmount, currency: fresh.totalCurrency },
    }
  }

  const paid = Number.parseFloat(fresh.totalAmount)
  const baselineAmount = snapshot?.baselineAmount ?? paid
  const baselineCurrency = snapshot?.baselineCurrency ?? fresh.totalCurrency
  const saved = computeSaving(baselineAmount, paid, baselineCurrency === fresh.totalCurrency)
  const mode = getDuffelMode() === 'live' ? 'live' : 'test'

  let pendingId: string | undefined
  try {
    const inserted = await db
      .insert(bookings)
      .values({
        userId: user.id,
        provider: 'duffel',
        providerRef: data.offerId,
        offerId: data.offerId,
        origin: data.origin,
        destination: data.destination,
        departDate: data.departDate,
        returnDate: data.returnDate,
        cabin: data.cabin,
        cashPrice: fresh.totalAmount,
        currency: fresh.totalCurrency,
        dataMode: mode,
        savingEur: String(saved),
        status: 'pending',
        passengers: data.passengers,
      })
      .returning({ id: bookings.id })
    pendingId = inserted[0]?.id
  } catch {
    const again = await db
      .select({ id: bookings.id, status: bookings.status, providerRef: bookings.providerRef })
      .from(bookings)
      .where(and(eq(bookings.userId, user.id), eq(bookings.provider, 'duffel'), eq(bookings.offerId, data.offerId)))
      .limit(1)
    const reused = reuseExistingBooking(again[0])
    if (reused?.status === 'confirmed') redirect(`/bookings/${reused.id}`)
    return { error: 'This booking is already in progress.' }
  }

  let order: { orderId: string; bookingRef: string }
  try {
    order = await createDuffelOrder({ offerId: data.offerId, passengers: data.passengers }, fresh)
  } catch (e) {
    if (pendingId) {
      await db.delete(bookings).where(eq(bookings.id, pendingId))
    }
    if (e instanceof Error && e.message === 'Live booking is disabled') return { error: e.message }
    if (e instanceof DuffelError) return { error: userMessageForDuffel(e) }
    return { error: 'Could not complete the booking with Duffel.' }
  }

  try {
    await db
      .update(bookings)
      .set({
        providerRef: order.bookingRef,
        providerOrderId: order.orderId,
        status: 'confirmed',
        cashPrice: fresh.totalAmount,
        currency: fresh.totalCurrency,
        dataMode: mode,
        savingEur: String(saved),
      })
      .where(eq(bookings.id, pendingId!))
  } catch {
    console.error('Booking persist failed after Duffel order', { orderId: order.orderId })
    return { error: `Booked, but saving failed. Reference: ${order.bookingRef}` }
  }

  redirect(`/bookings/${pendingId}`)
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
