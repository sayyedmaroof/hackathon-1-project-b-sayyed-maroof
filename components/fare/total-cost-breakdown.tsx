import { formatCount, formatMoney } from "@/lib/format";
import type { CostLine } from "@/lib/types";

const tones: Record<CostLine["kind"], string> = {
  fare: "bg-ink",
  bags: "bg-accent",
  ground: "bg-warn",
  taxes: "bg-ink-muted",
  points: "bg-saving",
  surcharges: "bg-warn",
  fees: "bg-accent",
};

/** Points as a count, and the cash lines as euros. */
export function TotalCostBreakdown({
  lines,
  totalLabel,
}: {
  lines: CostLine[];
  totalLabel: string;
}) {
  const money = lines.filter((line) => line.kind !== "points" && line.amount > 0);
  const total = money.reduce((sum, line) => sum + line.amount, 0);

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
        {money.map((line) => (
          <span
            key={line.kind}
            className={tones[line.kind]}
            style={{ width: total ? `${(line.amount / total) * 100}%` : "0%" }}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {lines.map((line) => (
          <li key={line.kind} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${tones[line.kind]}`} aria-hidden="true" />
              {line.label}
            </span>
            <span className="num">
              {line.kind === "points" ? formatCount(line.amount) : formatMoney(line.amount)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between border-t border-line pt-3 text-sm font-medium">
        <span>{totalLabel}</span>
        <span className="num">{formatMoney(total)}</span>
      </p>
    </div>
  );
}
