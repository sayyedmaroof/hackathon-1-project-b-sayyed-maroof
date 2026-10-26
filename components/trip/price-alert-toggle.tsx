"use client";

import { Switch } from "@/components/ui/switch";
import { Link } from "@/i18n/navigation";

/** Turns a price watch on, or sends a free plan to upgrade. */
export function PriceAlertToggle({
  checked,
  onChange,
  title,
  body,
  lockedLabel,
  upgradeHref,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  body: string;
  lockedLabel?: string;
  upgradeHref?: string;
}) {
  if (lockedLabel && upgradeHref) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
        <p className="text-sm font-medium">{title}</p>
        <Link href={upgradeHref} className="inline-flex min-h-11 items-center text-sm">
          {lockedLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-ink-muted">{body}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}
