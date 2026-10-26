import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-xl border border-line bg-surface px-3 py-3 text-base text-ink transition-colors outline-none placeholder:text-ink-muted focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-risk aria-invalid:ring-3 aria-invalid:ring-risk/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
