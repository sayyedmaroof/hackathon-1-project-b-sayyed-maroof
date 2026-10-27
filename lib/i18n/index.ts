import { en, type Messages } from './en'
import { es } from './es'

export type Locale = 'en' | 'es'

export const messages: Record<Locale, Messages> = { en, es }

export const LOCALE_KEY = 'fareflip-locale'

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'en' || value === 'es'
}
