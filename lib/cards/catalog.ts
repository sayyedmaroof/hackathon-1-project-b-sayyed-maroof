import type { CatalogCard, RevolutPlanId } from './types'

const TARJETAS_URL = 'https://aunamilladetudestino.com/tarjetas-de-credito'

/** Verified Revolut earn: points per EUR spent (guide). Ultra credit uses categoryEarn on card row when plan is ultra. */
export const REVOLUT_PLAN_EARN: Record<
  RevolutPlanId,
  { baseEarnPerEur: number; monthlyFeeEur: number; verified: boolean }
> = {
  premium: { baseEarnPerEur: 1 / 4, monthlyFeeEur: 9.99, verified: true },
  metal: { baseEarnPerEur: 1 / 2, monthlyFeeEur: 15.99, verified: true },
  ultra: { baseEarnPerEur: 1, monthlyFeeEur: 55, verified: true },
}

/** Ultra credit card earn (1.5 pt / €1) — verified from guide; applies to card spend category when on Ultra plan. */
export const REVOLUT_ULTRA_CREDIT_EARN = 1.5

/**
 * Earn rates, caps, fees and welcome bonuses below are ASSUMPTIONS unless `verified: true`.
 * The source website lists none of these numbers. Do not treat them as issuer claims.
 * Revolut plan earn and fees are the only verified rates (from our guide).
 */
export const CARD_CATALOG: CatalogCard[] = [
  {
    id: 'iberia_icon',
    name: 'Iberia Icon',
    issuer: 'Iberia / Santander',
    currency: 'iberia_avios',
    description_es:
      'La tarjeta Iberia Icon está pensada para quienes quieren acumular Avios en su día a día sin pagar comisión por cambio de divisa. Permite conseguir Avios con cada compra y ofrece beneficios como equipaje adicional, prioridad en listas de espera y promociones exclusivas de Iberia Plus. Es una buena tarjeta para viajeros frecuentes de Iberia que quieren acelerar la acumulación de Avios con gastos cotidianos.',
    description_en:
      'Iberia Plus Avios card for everyday spend, aimed at frequent Iberia flyers (no FX fee highlighted on the source page).',
    programName: 'Iberia Plus Avios',
    applyUrl: 'https://www.iberiacards.es/tarjetas-personales/iberia-icon/',
    imagePath: '/cards/iberia_icon.png',
    // ASSUMPTION — demo earn so everyday spend can close sample trips in months, not years.
    baseEarnPerEur: 1.5,
    categoryEarn: { travel: 2.5, dining: 1.5 },
    monthlyCapPoints: null,
    annualFeeEur: 120,
    monthlyFeeEur: null,
    welcomeBonusPoints: 9000,
    welcomeBonusMinSpend: 3000,
    sourceUrl: TARJETAS_URL,
    verified: false,
  },
  {
    id: 'iberia_icon_aire',
    name: 'Iberia Icon Aire',
    issuer: 'Iberia / Santander',
    currency: 'iberia_avios',
    description_es:
      'La Iberia Icon Aire es la versión de entrada para acumular Avios con compras diarias con una cuota más baja. Permite obtener Avios en compras, descuentos en vuelos de Iberia y promociones del programa Iberia Plus. Es una opción interesante para quienes vuelan ocasionalmente con Iberia y quieren empezar a acumular Avios sin pagar la cuota de la tarjeta premium.',
    description_en:
      'Entry-level Iberia Avios card with a lower fee, for occasional Iberia flyers.',
    programName: 'Iberia Plus Avios',
    applyUrl: 'https://www.iberiacards.es/tarjetas-personales/iberia-aire/',
    imagePath: '/cards/iberia_icon_aire.png',
    // ASSUMPTION — demo earn so everyday spend can close sample trips in months, not years.
    baseEarnPerEur: 1.2,
    monthlyCapPoints: null,
    annualFeeEur: 60,
    monthlyFeeEur: null,
    welcomeBonusPoints: 6000,
    welcomeBonusMinSpend: 2000,
    sourceUrl: TARJETAS_URL,
    verified: false,
  },
  {
    id: 'iberia_zenit_gold',
    name: 'Iberia Zenit Gold',
    issuer: 'Iberia / Santander',
    currency: 'iberia_avios',
    description_es:
      'La Iberia Zenit Gold combina acumulación de Avios con ventajas de tarjeta Oro como seguros de viaje, protección de compras y financiación flexible. Permite acumular Avios en todas las compras y suele incluir promociones de bienvenida con Avios. Está orientada a usuarios que quieren beneficios de viaje y pagos aplazados, además de acumular millas para vuelos.',
    description_en:
      'Gold-tier Iberia card mixing Avios earn with travel insurance and purchase protection.',
    programName: 'Iberia Plus Avios',
    applyUrl: 'https://www.iberiacards.es/tarjetas-personales/iberia-zenit/',
    imagePath: '/cards/iberia_zenit_gold.png',
    // ASSUMPTION — demo earn so everyday spend can close sample trips in months, not years.
    baseEarnPerEur: 1.8,
    categoryEarn: { travel: 2.5 },
    monthlyCapPoints: null,
    annualFeeEur: 150,
    monthlyFeeEur: null,
    welcomeBonusPoints: 12000,
    welcomeBonusMinSpend: 4000,
    sourceUrl: TARJETAS_URL,
    verified: false,
  },
  {
    id: 'revolut',
    name: 'Revolut (Premium / Metal / Ultra)',
    issuer: 'Revolut',
    currency: 'revolut_revpoints',
    description_es:
      'Revolut Ultra es una tarjeta premium con enfoque en viajes y servicios exclusivos. Incluye acceso a salas VIP, seguros de viaje completos, cashback en compras, suscripciones incluidas (apps y servicios digitales) y cambio de divisa sin comisiones en muchos casos. Es una tarjeta muy orientada a viajeros frecuentes y usuarios que quieren beneficios premium y servicios financieros globales.',
    description_en:
      'Revolut paid plans that earn RevPoints. Premium, Metal and Ultra rates below are verified from our guide.',
    programName: 'Revolut RevPoints',
    applyUrl: 'https://www.revolut.com/es-ES/credit-cards/',
    imagePath: '/cards/revolut.jpg',
    // Verified plan earn lives in REVOLUT_PLAN_EARN. Row uses Premium as the default display rate.
    baseEarnPerEur: 1 / 4,
    categoryEarn: { other: REVOLUT_ULTRA_CREDIT_EARN },
    monthlyCapPoints: null,
    annualFeeEur: null,
    monthlyFeeEur: 9.99,
    welcomeBonusPoints: 0,
    welcomeBonusMinSpend: 0,
    sourceUrl: TARJETAS_URL,
    verified: true,
  },
  {
    id: 'amex_platinum',
    name: 'Amex Platinum',
    issuer: 'American Express',
    currency: 'amex_mr',
    description_es:
      'La American Express Platinum es una de las tarjetas premium más completas del mercado español. Incluye acceso a salas VIP (Priority Pass y salas Amex), seguros de viaje muy completos, estatus en hoteles y alquiler de coches, créditos en viajes y restaurantes y acumulación de puntos Membership Rewards. Está pensada para viajeros frecuentes que quieren beneficios de lujo y servicios premium.',
    description_en:
      'Premium Membership Rewards charge card with lounge access and travel credits in Spain.',
    programName: 'Amex Membership Rewards',
    applyUrl: 'https://www.americanexpress.com/es-es/tarjetas/tarjetas-de-cargo/tarjeta-platinum/',
    imagePath: '/cards/amex_platinum.png',
    // ASSUMPTION — not published on the source page. Fee is a placeholder, not an issuer quote.
    baseEarnPerEur: 1,
    categoryEarn: { travel: 2, dining: 2 },
    monthlyCapPoints: null,
    annualFeeEur: 780,
    monthlyFeeEur: null,
    welcomeBonusPoints: 30000,
    welcomeBonusMinSpend: 6000,
    sourceUrl: TARJETAS_URL,
    verified: false,
  },
  {
    id: 'amex_gold',
    name: 'Amex Gold',
    issuer: 'American Express',
    currency: 'amex_mr',
    description_es:
      'La American Express Gold permite acumular puntos Membership Rewards en todas las compras que luego se pueden transferir a programas de aerolíneas y hoteles. Incluye seguros de viaje, promociones Amex Offers y beneficios en restauración y viajes. Es una buena tarjeta para acumular puntos flexibles sin pagar la cuota alta de la Platinum.',
    description_en:
      'Membership Rewards card with a lower fee than Platinum, useful for dining and groceries in this model.',
    programName: 'Amex Membership Rewards',
    applyUrl: 'https://www.americanexpress.com/es-es/tarjetas/tarjetas-de-cargo/tarjeta-gold-card/',
    imagePath: '/cards/amex_gold.jpg',
    // ASSUMPTION — not published on the source page.
    baseEarnPerEur: 1,
    categoryEarn: { dining: 2, groceries: 2 },
    monthlyCapPoints: null,
    annualFeeEur: 180,
    monthlyFeeEur: null,
    welcomeBonusPoints: 20000,
    welcomeBonusMinSpend: 3000,
    sourceUrl: TARJETAS_URL,
    verified: false,
  },
  {
    id: 'air_europa_bankinter',
    name: 'Air Europa Bankinter',
    issuer: 'Bankinter',
    currency: 'air_europa_suma',
    description_es:
      'La tarjeta Air Europa Bankinter permite acumular millas del programa SUMA en compras diarias y ofrece beneficios como facturación prioritaria, promociones en vuelos y posibilidad de conseguir vuelos con millas más rápido. Está orientada a clientes que vuelan con Air Europa y quieren acumular millas sin depender solo de los vuelos.',
    description_en:
      'Bankinter card that earns Air Europa SUMA miles on everyday spend. SUMA does not transfer to Avios in this model.',
    programName: 'Air Europa SUMA',
    applyUrl:
      'https://www.aireuropa.com/es/es/aea/suma/nuestro-programa/nuestros-partners/financiero/visa-aireuropa-suma.html',
    imagePath: '/cards/air_europa_bankinter.jpg',
    // ASSUMPTION — demo earn so everyday spend can close sample trips in months, not years.
    baseEarnPerEur: 0.8,
    categoryEarn: { travel: 1.2 },
    monthlyCapPoints: null,
    annualFeeEur: 40,
    monthlyFeeEur: null,
    welcomeBonusPoints: 5000,
    welcomeBonusMinSpend: 1500,
    sourceUrl: TARJETAS_URL,
    verified: false,
  },
  {
    id: 'vueling_up',
    name: 'Vueling UP',
    issuer: 'Vueling / CaixaBank',
    currency: 'vueling_avios',
    description_es:
      'La tarjeta Vueling UP permite acumular Avios con compras y vuelos de Vueling, además de beneficios como embarque prioritario, descuentos en vuelos y promociones exclusivas. Es una tarjeta interesante para quienes vuelan frecuentemente con Vueling y quieren acumular Avios para usar en Iberia, British Airways o Vueling.',
    description_en:
      'CaixaBank Vueling card that earns Avios, usable across the Avios family after transfer.',
    programName: 'Vueling Club Avios',
    applyUrl: 'https://www.vueling.com/es/vueling-club/vueling-visa',
    imagePath: '/cards/vueling_up.png',
    // ASSUMPTION — demo earn so everyday spend can close sample trips in months, not years. Cap is a model limit.
    baseEarnPerEur: 1.2,
    categoryEarn: { travel: 3 },
    monthlyCapPoints: 5000,
    annualFeeEur: 45,
    monthlyFeeEur: null,
    welcomeBonusPoints: 8000,
    welcomeBonusMinSpend: 2500,
    sourceUrl: TARJETAS_URL,
    verified: false,
  },
  {
    id: 'miles_and_more_caixabank',
    name: 'Miles & More CaixaBank',
    issuer: 'CaixaBank',
    currency: 'miles_and_more',
    description_es:
      'La tarjeta Miles & More de Caixabank permite acumular millas del programa Miles & More (Lufthansa Group) con todas las compras. Incluye seguros de viaje y promociones para ganar millas extra. Es especialmente interesante para quienes vuelan con Lufthansa, Swiss, Austrian o Brussels Airlines y quieren acumular millas en Star Alliance desde España.',
    description_en:
      'CaixaBank card that earns Lufthansa Group Miles & More. Those miles do not transfer to Avios in this model.',
    programName: 'Miles & More',
    applyUrl: 'https://www.caixabank.es/particular/tarjetas/visa-miles-and-more.html',
    imagePath: '/cards/miles_and_more_caixabank.png',
    // ASSUMPTION — demo earn so everyday spend can close sample trips in months, not years.
    baseEarnPerEur: 1,
    monthlyCapPoints: null,
    annualFeeEur: 55,
    monthlyFeeEur: null,
    welcomeBonusPoints: 7000,
    welcomeBonusMinSpend: 2000,
    sourceUrl: TARJETAS_URL,
    verified: false,
  },
]

export function getCatalogCard(id: string): CatalogCard | undefined {
  return CARD_CATALOG.find((c) => c.id === id)
}
