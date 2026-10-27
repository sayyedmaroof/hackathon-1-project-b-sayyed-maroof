import { isSandboxMode, type DataMode } from '@/lib/providers/types'

export function DataModeLabel({ mode }: { mode?: DataMode }) {
  if (mode === 'test') {
    return <p className="text-xs text-[#8a796b]">Test data: sandbox fares, not real prices</p>
  }
  if (mode === 'sample') {
    return <p className="text-xs text-[#8a796b]">Sample data</p>
  }
  return null
}

export function sandboxCopy(mode?: DataMode) {
  return isSandboxMode(mode)
}
