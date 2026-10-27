import type { UserSpendProfile, UserWallet } from './types'

/** Documented assumption: cost to buy one point in EUR when topping up. */
export const TOP_UP_EUR_PER_POINT = 0.02

/** Months to meet welcome bonus minimum spend. */
export const WELCOME_BONUS_MONTHS = 3

export const ILLUSTRATIVE_RATES_LABEL = 'Illustrative rates, verify with the issuer'

export const AVIOS_ACCOUNT_AGE_NOTE =
  'Accounts must be at least 30 days old and personal details must match between programs.'

/** Sample profile for logged-out users (site “Iván” example). */
export const SAMPLE_SPEND_PROFILE: UserSpendProfile = {
  monthlyTotalEur: 1500,
  groceriesEur: 400,
  travelEur: 200,
  diningEur: 250,
  fuelEur: 150,
  otherEur: 500,
}

export const SAMPLE_WALLET: UserWallet = {
  cards: [],
  balances: [],
  spend: SAMPLE_SPEND_PROFILE,
}
