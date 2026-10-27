export type ExistingBooking = {
  id: string
  status: string
  providerRef: string
}

export function reuseExistingBooking(row: ExistingBooking | null | undefined): ExistingBooking | null {
  if (!row) return null
  if (row.status === 'confirmed' || row.status === 'pending') return row
  return null
}
