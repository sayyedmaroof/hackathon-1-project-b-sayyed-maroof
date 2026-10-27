export const VIEWS = [
  'home',
  'dashboard',
  'search',
  'results',
  'planner',
  'trips',
  'alerts',
  'loyalty',
  'savings',
] as const

export type View = (typeof VIEWS)[number]

export function isView(value: string): value is View {
  return (VIEWS as readonly string[]).includes(value)
}

export type Cabin = 'Economy' | 'Premium Economy' | 'Business' | 'First'

export type FlightOption = {
  id: string
  airline: string
  code: string
  from: string
  to: string
  departTime: string
  arriveTime: string
  duration: string
  stops: string
  cash: number
  points: number
  fees: number
  tone: string
  cabin: Cabin
}

export type Trip = {
  id: string
  title: string
  detail: string
  cash: number
  fees: number
  points: number
  program: string
  cabin?: Cabin
  airline?: string
  bookUrl?: string
  checklist?: string[]
}

export type LoyaltyProgram = {
  id: string
  name: string
  balance: number
  unit: string
  note: string
}

export type Alert = {
  id: string
  route: string
  detail: string
  active: boolean
  cabin?: Cabin
  targetPrice?: number
  targetPoints?: number
}

export type SearchMode = 'Compare both' | 'Cash fares' | 'Points options'

export type SearchQuery = {
  origin: string
  destination: string
  when: string
  depart: string
  returnDate: string
  travelers: string
  cabin: Cabin
  mode: SearchMode
  flexible: boolean
}

export type SearchErrors = Partial<Record<'origin' | 'destination' | 'depart' | 'returnDate', string>>

export type StopsFilter = 'any' | 'nonstop' | '1'
export type DepartureWindow = 'any' | 'morning' | 'afternoon' | 'evening'

export type FlightFilters = {
  maxCash: number
  maxPoints: number
  /** Included airlines. Used only when `airlineSelection` is true; an empty list matches nothing. */
  airlines: string[]
  airlineSelection: boolean
  stops: StopsFilter
  departureWindow: DepartureWindow
}

export type FlexibleDay = {
  date: string
  label: string
  delta: number
}

export type Airport = {
  code: string
  city: string
  name: string
  country: string
}

export type Destination = {
  city: string
  country: string
  code: string
  meta: string
  image: string
}

export type RevolutPlan = 'Premium' | 'Metal' | 'Ultra'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  trip?: Trip
}

export type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
}
