'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Heart, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/button'
import { DetailsDrawer } from '@/components/details-drawer'
import { PlanCard, PlanSummary } from '@/components/planner-cards'
import { navigate } from '@/lib/hash-view'
import { buildPlannerReply, plannerGreeting, plannerUid } from '@/lib/planner-reply'
import { useApp } from '@/lib/store'
import { toastRemoved, toastSaved } from '@/lib/toast-messages'
import type { ChatMessage, Conversation, Trip } from '@/lib/types'
import { cn } from '@/lib/utils'

function latestTrip(conversation: Conversation | undefined): Trip | null {
  if (!conversation) return null
  for (let index = conversation.messages.length - 1; index >= 0; index -= 1) {
    const trip = conversation.messages[index]?.trip
    if (trip) return trip
  }
  return null
}

export function ChatPlanner() {
  const { state, newConversation, openConversation, appendMessage, toggleTrip, showToast } = useApp()
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [details, setDetails] = useState<Trip | null>(null)
  const timer = useRef<number | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const conversation = state.conversations.find((item) => item.id === state.activeConversationId)
  const plan = latestTrip(conversation)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  useEffect(() => {
    const node = scroller.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [conversation?.messages.length, thinking, conversation?.id])

  function startNew() {
    if (timer.current) window.clearTimeout(timer.current)
    setThinking(false)
    setDraft('')
    newConversation({ id: plannerUid(), title: 'New plan', messages: [plannerGreeting()] })
  }

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || thinking) return
    let id = conversation?.id
    let history = conversation?.messages ?? []
    let title: string | undefined
    if (!id) {
      id = plannerUid()
      history = [plannerGreeting()]
      newConversation({ id, title: trimmed.slice(0, 48), messages: history })
    } else if (!history.some((message) => message.role === 'user')) {
      title = trimmed.slice(0, 48)
    }
    const userMessage: ChatMessage = { id: plannerUid(), role: 'user', text: trimmed }
    appendMessage(id, userMessage, title)
    const nextHistory = [...history, userMessage]
    setDraft('')
    setThinking(true)
    timer.current = window.setTimeout(() => {
      appendMessage(id!, buildPlannerReply(nextHistory))
      setThinking(false)
    }, 800)
  }

  return (
    <div className="grid min-h-[calc(100vh-156px)] gap-5 lg:grid-cols-[220px_1fr_280px]">
      <aside className="panel hidden p-4 lg:block">
        <Button variant="terra" className="w-full" onClick={startNew}>
          <Plus className="size-4" /> New plan
        </Button>
        <p className="mt-8 px-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#a39182]">Recent plans</p>
        {state.conversations.length === 0 ? (
          <p className="mt-3 px-2 text-sm text-[#76675c]">No plans yet. Start one to keep the conversation.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-1 text-sm">
            {state.conversations.map((item) => (
              <button
                key={item.id}
                onClick={() => openConversation(item.id)}
                className={cn(
                  'rounded-xl p-3 text-left hover:bg-[#f0e8dc]',
                  item.id === conversation?.id ? 'bg-[#ead2bc] font-semibold' : 'text-[#76675c]',
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        )}
      </aside>
      <section className="panel flex min-h-[70vh] flex-col overflow-hidden">
        <div className="border-b border-[#e8ddd1] p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#ead2bc]">
              <Sparkles className="size-4 text-[#b86632]" />
            </span>
            <div>
              <p className="font-semibold">FareFlip</p>
              <p className="text-xs text-[#8a796b]">Award strategist · Sample data</p>
            </div>
          </div>
        </div>
        <div ref={scroller} className="flex-1 overflow-auto p-5 md:p-8">
          {conversation ? (
            <div className="flex max-w-xl flex-col gap-4">
              {conversation.messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={cn(
                      'rounded-2xl p-4 text-sm leading-6',
                      message.role === 'user' ? 'ml-auto max-w-[80%] rounded-br-sm bg-[#ead2bc]' : 'max-w-[86%] rounded-bl-sm bg-[#f0e8dc]',
                    )}
                  >
                    {message.text}
                  </div>
                  {message.trip && (
                    <PlanCard
                      plan={message.trip}
                      onSave={() => {
                        const saved = state.trips.some((trip) => trip.id === message.trip?.id)
                        toggleTrip(message.trip as Trip)
                        showToast(saved ? toastRemoved() : toastSaved())
                      }}
                      onDetails={() => setDetails(message.trip as Trip)}
                    />
                  )}
                </div>
              ))}
              {thinking && (
                <div className="max-w-[86%] rounded-2xl rounded-bl-sm bg-[#f0e8dc] p-4 text-sm text-[#76675c]" role="status" aria-live="polite">
                  <div className="h-3 w-40 animate-pulse rounded-full bg-[#ead2bc]" />
                  <p className="mt-2">Looking through sample fares…</p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-md">
              <h2 className="text-2xl font-semibold">No plans yet</h2>
              <p className="mt-2 text-sm text-[#76675c]">Start a plan and describe the trip in your own words.</p>
              <Button variant="terra" className="mt-6" onClick={startNew}>
                <Plus className="size-4" /> New plan
              </Button>
            </div>
          )}
        </div>
        <div className="border-t border-[#e8ddd1] p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-[#d7c9b9] bg-[#fffdf9] p-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                  event.preventDefault()
                  send(draft)
                }
              }}
              placeholder="Tell us about your trip…"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
              aria-label="Message FareFlip"
            />
            <button
              onClick={() => send(draft)}
              className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full bg-[#b86632] text-white"
              aria-label="Send message"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-[#a39182]">Sample data · Demo prices. Always verify availability before booking.</p>
        </div>
      </section>
      <aside className="panel hidden p-5 lg:block">
        {plan ? (
          <>
            <p className="eyebrow">Your plan</p>
            <h2 className="mt-3 text-xl font-semibold">{plan.title}</h2>
            <p className="mt-1 text-xs text-[#8a796b]">{plan.detail}</p>
            <PlanSummary plan={plan} />
            <Button
              variant="outline"
              className="mt-8 w-full"
              onClick={() => {
                const saved = state.trips.some((trip) => trip.id === plan.id)
                toggleTrip(plan)
                showToast(saved ? toastRemoved() : toastSaved())
              }}
            >
              Save plan
            </Button>
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setDetails(plan)}>
              See details
            </Button>
          </>
        ) : (
          <>
            <p className="eyebrow">Your plan</p>
            <h2 className="mt-3 text-xl font-semibold">Nothing picked yet</h2>
            <p className="mt-2 text-sm text-[#76675c]">The latest sample fare in this conversation will show up here.</p>
            <Button variant="outline" className="mt-8 w-full" onClick={() => navigate('search')}>
              Search flights
            </Button>
          </>
        )}
      </aside>
      {details && <DetailsDrawer trip={details} onClose={() => setDetails(null)} />}
    </div>
  )
}
