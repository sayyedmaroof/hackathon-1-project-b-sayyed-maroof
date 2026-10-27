'use client'

import { SearchFields } from '@/components/search-fields'

export function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl py-8">
      <p className="eyebrow">Find your way there</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-[-.07em]">Where will you go next?</h1>
      <p className="mt-4 max-w-xl text-[#76675c]">Search cash fares, points options, and smarter routes — all in one place.</p>
      <SearchFields variant="page" />
    </div>
  )
}
