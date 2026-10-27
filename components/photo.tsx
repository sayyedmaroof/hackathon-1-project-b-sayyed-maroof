'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <div role="img" aria-label={alt} className={cn('bg-[#c4a484]', className)} />
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
}
