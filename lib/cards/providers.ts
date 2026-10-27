import { CARD_CATALOG } from './catalog'
import { TRANSFER_EDGES } from './transfers'
import { POINT_CURRENCIES } from './currencies'
import type { CatalogCard, PointCurrencyId, TransferEdge, UserBalance } from './types'

export interface CardCatalogProvider {
  listCards(): CatalogCard[]
  listTransfers(): TransferEdge[]
  listCurrencies(): typeof POINT_CURRENCIES
}

export interface BalanceProvider {
  /** Sample/no-op: real balances load from DB in wallet actions. */
  getDefaultBalances(): UserBalance[]
}

export const sampleCardCatalogProvider: CardCatalogProvider = {
  listCards: () => CARD_CATALOG,
  listTransfers: () => TRANSFER_EDGES,
  listCurrencies: () => POINT_CURRENCIES,
}

export const sampleBalanceProvider: BalanceProvider = {
  getDefaultBalances: () =>
    (Object.keys(POINT_CURRENCIES) as PointCurrencyId[]).map((currency) => ({
      currency,
      balance: 0,
    })),
}

export const defaultCardProviders = {
  catalog: sampleCardCatalogProvider,
  balance: sampleBalanceProvider,
}
