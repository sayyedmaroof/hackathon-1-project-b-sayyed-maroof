'use client'

import { useState } from 'react'
import { Tag } from 'lucide-react'
import { Button } from '@/components/button'
import { AlertForm } from '@/components/library/alert-form'
import { EmptyCard, LibraryFrame, Promo } from '@/components/library/library-frame'
import { useApp } from '@/lib/store'

export function AlertsView() {
  const { state, addAlert, toggleAlert, deleteAlert, showToast } = useApp()
  const [creating, setCreating] = useState(false)

  return (
    <LibraryFrame
      eyebrow="Personal library"
      title="Price alerts"
      lede="We’ll keep an eye on the routes that matter to you. This prototype stores them on your device."
      action="Create alert"
      onAction={() => setCreating(true)}
    >
      {creating && <AlertForm onClose={() => setCreating(false)} onCreate={(alert) => { addAlert(alert); showToast('Alert saved'); setCreating(false) }} />}
      {state.alerts.length === 0 && !creating ? (
        <EmptyCard title="No alerts yet" detail="Set a target price or points balance for a route." action="Create alert" onAction={() => setCreating(true)} />
      ) : (
        state.alerts.map((alert) => (
          <article key={alert.id} className="panel min-h-48">
            <div className="flex items-center justify-between">
              <button className="status" onClick={() => toggleAlert(alert.id)}>
                {alert.active ? 'Active' : 'Paused'}
              </button>
              <Tag className="size-4 text-[#b86632]" />
            </div>
            <h2 className="mt-10 text-2xl font-semibold">{alert.route}</h2>
            <p className="mt-2 text-sm text-[#76675c]">{alert.detail}</p>
            <p className="mt-6 text-sm font-semibold text-[#b86632]">Sample data · Demo prices</p>
            <Button
              variant="ghost"
              className="mt-4 min-h-9 px-3"
              onClick={() => {
                deleteAlert(alert.id)
                showToast('Alert deleted')
              }}
            >
              Delete
            </Button>
          </article>
        ))
      )}
      <Promo />
    </LibraryFrame>
  )
}
