import { relations } from 'drizzle-orm'
import {
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const bookingProviderEnum = pgEnum('booking_provider', ['duffel', 'award_guide'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
})

export const emailTokens = pgTable('email_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
})

export const searches = pgTable('searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  departDate: text('depart_date').notNull(),
  returnDate: text('return_date').notNull(),
  cabin: text('cabin').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: bookingProviderEnum('provider').notNull(),
    providerRef: text('provider_ref').notNull(),
    origin: text('origin').notNull(),
    destination: text('destination').notNull(),
    departDate: text('depart_date').notNull(),
    returnDate: text('return_date').notNull(),
    cabin: text('cabin').notNull(),
    cashPrice: numeric('cash_price', { precision: 12, scale: 2 }).notNull(),
    awardPoints: numeric('award_points', { precision: 12, scale: 0 }),
    awardFees: numeric('award_fees', { precision: 12, scale: 2 }),
    savingEur: numeric('saving_eur', { precision: 12, scale: 2 }).notNull(),
    status: text('status').notNull(),
    passengers: jsonb('passengers').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    offerId: text('offer_id'),
    providerOrderId: text('provider_order_id'),
    currency: text('currency'),
    dataMode: text('data_mode'),
  },
  (t) => [uniqueIndex('bookings_user_provider_offer_uidx').on(t.userId, t.provider, t.offerId)],
)

export {
  userCards,
  userBalances,
  userSpendProfile,
  userCardsRelations,
  userBalancesRelations,
  userSpendProfileRelations,
} from './schema-wallet'

import { userCards, userBalances, userSpendProfile } from './schema-wallet'

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  emailTokens: many(emailTokens),
  searches: many(searches),
  bookings: many(bookings),
  userCards: many(userCards),
  userBalances: many(userBalances),
  spendProfile: one(userSpendProfile),
}))
