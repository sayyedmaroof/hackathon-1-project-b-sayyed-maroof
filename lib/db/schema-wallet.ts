import { relations } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { users } from './schema'

export const userCards = pgTable(
  'user_cards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cardId: text('card_id').notNull(),
    revolutPlan: text('revolut_plan'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('user_cards_user_card').on(t.userId, t.cardId), index('user_cards_user_id_idx').on(t.userId)],
)

export const userBalances = pgTable(
  'user_balances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    currency: text('currency').notNull(),
    balance: integer('balance').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('user_balances_user_currency').on(t.userId, t.currency), index('user_balances_user_id_idx').on(t.userId)],
)

export const userSpendProfile = pgTable('user_spend_profile', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  monthlyTotalEur: integer('monthly_total_eur').notNull().default(0),
  groceriesEur: integer('groceries_eur').notNull().default(0),
  travelEur: integer('travel_eur').notNull().default(0),
  diningEur: integer('dining_eur').notNull().default(0),
  fuelEur: integer('fuel_eur').notNull().default(0),
  otherEur: integer('other_eur').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const userCardsRelations = relations(userCards, ({ one }) => ({
  user: one(users, { fields: [userCards.userId], references: [users.id] }),
}))

export const userBalancesRelations = relations(userBalances, ({ one }) => ({
  user: one(users, { fields: [userBalances.userId], references: [users.id] }),
}))

export const userSpendProfileRelations = relations(userSpendProfile, ({ one }) => ({
  user: one(users, { fields: [userSpendProfile.userId], references: [users.id] }),
}))
