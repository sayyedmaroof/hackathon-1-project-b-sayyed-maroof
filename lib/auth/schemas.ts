import { z } from 'zod'
import { MIN_PASSWORD_LENGTH } from './constants'

export const signUpSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
  name: z.string().min(1).max(120).trim(),
})

export const logInSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1),
})

export const resendSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
})

export const passengerSchema = z.object({
  givenName: z.string().min(1).max(80).trim(),
  familyName: z.string().min(1).max(80).trim(),
  email: z.string().email(),
  phone: z.string().min(6).max(30).trim(),
  bornOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['m', 'f']),
})

export const bookCashSchema = z.object({
  offerId: z.string().min(1),
  normalPrice: z.coerce.number().nonnegative(),
  origin: z.string().length(3),
  destination: z.string().length(3),
  departDate: z.string(),
  returnDate: z.string(),
  cabin: z.string(),
  cashPrice: z.coerce.number().nonnegative(),
  passengers: z.array(passengerSchema).min(1).max(9),
})

export const markAwardBookedSchema = z.object({
  offerKey: z.string().min(1),
  normalPrice: z.coerce.number().nonnegative(),
  origin: z.string().length(3),
  destination: z.string().length(3),
  departDate: z.string(),
  returnDate: z.string(),
  cabin: z.string(),
  cashPrice: z.coerce.number().nonnegative(),
  awardPoints: z.coerce.number().nonnegative(),
  awardFees: z.coerce.number().nonnegative(),
  passengers: z.array(passengerSchema).min(1).max(9),
})
