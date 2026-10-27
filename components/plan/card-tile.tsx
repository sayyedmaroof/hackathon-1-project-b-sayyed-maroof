'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { CatalogCard, RevolutPlanId } from '@/lib/cards/types'
import { ILLUSTRATIVE_RATES_LABEL } from '@/lib/cards/constants'

export function CardTile({
  card,
  selected,
  revolutPlan,
  onSelect,
  onPlan,
}: {
  card: CatalogCard
  selected: boolean
  revolutPlan: RevolutPlanId
  onSelect: () => void
  onPlan?: (plan: RevolutPlanId) => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const letter = card.name.charAt(0)

  return (
    <div
      className={`flex flex-col rounded-2xl border p-4 ${
        selected ? 'border-[#b86632] bg-[#fff6ee] ring-2 ring-[#b86632]/30' : 'border-[#e1d6c8] bg-[#fffaf2]'
      }`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        onClick={onSelect}
        className="min-h-11 text-left"
      >
        <div className="mb-3 overflow-hidden rounded-xl bg-[#eee4d8]">
          {imgFailed ? (
            <div className="grid h-28 place-items-center text-3xl font-semibold text-ink-muted">{letter}</div>
          ) : (
            <Image
              src={card.imagePath}
              alt=""
              width={400}
              height={160}
              className="h-28 w-full object-contain"
              sizes="(max-width: 768px) 100vw, 40vw"
              onError={() => setImgFailed(true)}
            />
          )}
        </div>
        <p className="font-semibold">{card.name}</p>
        <p className="text-xs text-[#76675c]">{card.issuer}</p>
        <p className="mt-2 text-sm leading-5 text-[#66584e]">{card.description_en}</p>
      </button>
      {!card.verified ? (
        <span className="mt-2 inline-flex w-fit rounded-full bg-[#eee4d8] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#66584e]">
          Illustrative
        </span>
      ) : (
        <span className="mt-2 inline-flex w-fit rounded-full bg-[#e7f0dc] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#3d5a28]">
          Verified rates
        </span>
      )}
      {card.id === 'revolut' && selected && onPlan ? (
        <label className="mt-3 text-xs font-semibold text-[#66584e]">
          Revolut plan
          <select
            className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] bg-white px-3 text-sm"
            value={revolutPlan}
            onChange={(e) => onPlan(e.target.value as RevolutPlanId)}
          >
            <option value="premium">Premium</option>
            <option value="metal">Metal</option>
            <option value="ultra">Ultra</option>
          </select>
        </label>
      ) : null}
      <a
        href={card.applyUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 min-h-11 inline-flex items-center text-sm font-semibold text-[#b86632]"
      >
        Official site
      </a>
      {!card.verified ? <p className="mt-2 text-[11px] text-[#8a796b]">{ILLUSTRATIVE_RATES_LABEL}</p> : null}
    </div>
  )
}
