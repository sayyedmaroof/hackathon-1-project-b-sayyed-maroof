import type { TransferEdge } from './types'

const AVIOS_BRIDGE_NOTES =
  'Accounts must be at least 30 days old and personal details must match between programs.'

/** Transfer graph edges; Avios family linked through British Airways as bridge. */
export const TRANSFER_EDGES: TransferEdge[] = [
  { from: 'iberia_avios', to: 'ba_avios', ratio: 1, minAmount: 1, increment: 1, notes: AVIOS_BRIDGE_NOTES, verified: true },
  { from: 'ba_avios', to: 'iberia_avios', ratio: 1, minAmount: 1, increment: 1, notes: AVIOS_BRIDGE_NOTES, verified: true },
  { from: 'vueling_avios', to: 'ba_avios', ratio: 1, minAmount: 1, increment: 1, notes: AVIOS_BRIDGE_NOTES, verified: true },
  { from: 'ba_avios', to: 'vueling_avios', ratio: 1, minAmount: 1, increment: 1, notes: AVIOS_BRIDGE_NOTES, verified: true },
  { from: 'qatar_avios', to: 'ba_avios', ratio: 1, minAmount: 1, increment: 1, notes: AVIOS_BRIDGE_NOTES, verified: true },
  { from: 'ba_avios', to: 'qatar_avios', ratio: 1, minAmount: 1, increment: 1, notes: AVIOS_BRIDGE_NOTES, verified: true },
  // ASSUMPTION: verify with issuer before relying on these paths.
  { from: 'revolut_revpoints', to: 'ba_avios', ratio: 1, minAmount: 1000, increment: 1, verified: false },
  { from: 'revolut_revpoints', to: 'iberia_avios', ratio: 1, minAmount: 1000, increment: 1, verified: false },
  { from: 'amex_mr', to: 'ba_avios', ratio: 1, minAmount: 1000, increment: 1, verified: false },
  { from: 'amex_mr', to: 'iberia_avios', ratio: 1, minAmount: 1000, increment: 1, verified: false },
  { from: 'amex_mr', to: 'qatar_avios', ratio: 1, minAmount: 1000, increment: 1, verified: false },
]
