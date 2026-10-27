'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePlan } from '@/app/actions/saved-plans'
import { Button } from '@/components/button'

export function DeletePlanButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  return (
    <div>
      <Button
        variant="outline"
        className="min-h-11"
        disabled={pending}
        onClick={async () => {
          setPending(true)
          setError('')
          const res = await deletePlan(id)
          setPending(false)
          if (!res.ok) {
            setError('Could not delete this plan.')
            return
          }
          router.refresh()
        }}
      >
        {pending ? 'Deleting…' : 'Delete plan'}
      </Button>
      {error ? (
        <p className="mt-2 text-sm text-[#8b3a2a]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
