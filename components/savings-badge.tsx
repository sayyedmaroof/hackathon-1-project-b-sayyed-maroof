import { calculateSavings, savingsLabel, type SavingsInput } from '@/lib/savings'

export function SavingsBadge({ cash, fees, points, centsPerPoint }: SavingsInput) {
  const savings = calculateSavings({ cash, fees, points, centsPerPoint })
  return <span className={savings.verdict === 'poor' ? 'mock-label' : 'status'}>{savingsLabel(savings.verdict)}</span>
}
