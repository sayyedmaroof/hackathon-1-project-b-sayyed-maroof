import { airportLabel, airports } from './airports.ts'
import { defaultSearch, flightToTrip } from './data.ts'
import { datesFromWhen, formatRange } from './dates.ts'
import { parseTripIntent, type IntentField } from './intent.ts'
import { searchFlights } from './search.ts'
import { calculateSavings, formatEuro, formatPoints, savingsLabel } from './savings.ts'
import type { ChatMessage, SearchQuery } from './types.ts'

const QUESTIONS: Record<IntentField, string> = {
  destination: 'Where would you like to fly?',
  cabin: 'Which cabin should I look at — Economy, Premium Economy, Business, or First?',
  budgetEuro: "What's the most you'd like to spend, in euros?",
  when: 'When are you hoping to travel?',
  pointsBalance: 'About how many points do you have to use?',
}

export function plannerUid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function plannerGreeting(): ChatMessage {
  return {
    id: plannerUid(),
    role: 'assistant',
    text: "Hi Maria. Where are you dreaming of going? Tell me as much or as little as you like — I'll help you find the smartest way there.",
  }
}

export function buildPlannerReply(history: ChatMessage[]): ChatMessage {
  const text = history.filter((message) => message.role === 'user').map((message) => message.text).join('\n')
  const intent = parseTripIntent(text)
  if (intent.missing.length > 0) {
    return { id: plannerUid(), role: 'assistant', text: QUESTIONS[intent.missing[0]] }
  }

  const airport = airports.find((item) => item.code === intent.destination)
  const dates = intent.when ? datesFromWhen(intent.when) : null
  if (!airport || !dates || !intent.cabin) {
    return {
      id: plannerUid(),
      role: 'assistant',
      text: 'I could not turn that into a sample search. Try a city, a cabin, a budget, and a month.',
    }
  }

  const query: SearchQuery = {
    ...defaultSearch,
    origin: 'Madrid (MAD)',
    destination: airportLabel(airport),
    depart: dates.depart,
    returnDate: dates.returnDate,
    when: formatRange(dates.depart, dates.returnDate),
    cabin: intent.cabin,
    mode: 'Compare both',
  }
  let flights = searchFlights(query, intent.cabin)
  if (intent.budgetEuro != null) {
    const affordable = flights.filter((flight) => flight.fees <= intent.budgetEuro!)
    if (affordable.length === 0) {
      return {
        id: plannerUid(),
        role: 'assistant',
        text: `No sample fares to ${airport.city} fit a €${intent.budgetEuro} fee budget in ${intent.cabin}.`,
      }
    }
    flights = affordable
  }
  flights.sort((a, b) => calculateSavings(b).netSaving - calculateSavings(a).netSaving)
  const best = flights[0]
  if (!best) {
    return { id: plannerUid(), role: 'assistant', text: `No sample fares for Madrid → ${airport.city}.` }
  }
  const trip = flightToTrip(best, query)
  const savings = calculateSavings(best)
  return {
    id: plannerUid(),
    role: 'assistant',
    text: `You mentioned ${formatPoints(intent.pointsBalance ?? 0)} points. Sample option for ${trip.title}: ${formatPoints(best.points)} Avios and ${formatEuro(best.fees)} in fees. Estimated net saving is ${formatEuro(savings.netSaving)} versus the ${formatEuro(best.cash)} cash fare. ${savingsLabel(savings.verdict)}.`,
    trip,
  }
}
