export const RESULTS_LOADING_KEY = 'fareflip-results-loading'

export function markResultsLoading() {
  try {
    if (typeof window !== 'undefined') sessionStorage.setItem(RESULTS_LOADING_KEY, '1')
  } catch {
    // ignore
  }
}

export function consumeResultsLoading(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const pending = sessionStorage.getItem(RESULTS_LOADING_KEY) === '1'
    if (pending) sessionStorage.removeItem(RESULTS_LOADING_KEY)
    return pending
  } catch {
    return false
  }
}
