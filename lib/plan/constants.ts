/** Default days before travel when points should be ready. Documented assumption. */
export const READY_BY_DAYS_DEFAULT = 60
export const READY_BY_DAYS_MIN = 30
export const READY_BY_DAYS_MAX = 330

/** Top-up only when shortfall is under this share of pointsRequired. */
export const TOP_UP_MAX_SHORTFALL_RATIO = 0.15

/** Almost reachable: short by at most this share of pointsRequired. */
export const ALMOST_SHORTFALL_RATIO = 0.2

/**
 * Verdict thresholds (named, documented):
 * great = saving >= GREAT_MIN_EUR and saving >= GREAT_MIN_RATIO * cash baseline
 * good = saving > 0
 * poor = saving <= 0
 */
export const GREAT_MIN_EUR = 400
export const GREAT_MIN_RATIO = 0.15

export const FALLBACK_FARE_NOTE = 'Live fare unavailable, using a sample estimate'
