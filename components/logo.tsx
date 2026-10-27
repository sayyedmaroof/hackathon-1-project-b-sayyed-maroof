import { Plane } from 'lucide-react'
import { navigate } from '@/lib/hash-view'
import { cn } from '@/lib/utils'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <button
      onClick={() => navigate('home')}
      className={cn(
        'flex items-center gap-2 font-semibold tracking-[-0.04em]',
        light ? 'text-[#fffaf2]' : 'text-[#2a211b]',
      )}
    >
      <span
        className={cn(
          'grid size-8 place-items-center rounded-full',
          light ? 'bg-[#b86632]' : 'bg-[#2a211b]',
        )}
      >
        <Plane className="size-4 -rotate-12 text-[#fffaf2]" />
      </span>
      <span className="whitespace-nowrap text-[19px]">FareFlip</span>
    </button>
  )
}
