'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-[#f7f2e9] p-8 text-[#2a211b]">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <button type="button" className="mt-4 min-h-11 rounded-full bg-[#b86632] px-5 text-white" onClick={reset}>
          Retry
        </button>
      </body>
    </html>
  )
}
