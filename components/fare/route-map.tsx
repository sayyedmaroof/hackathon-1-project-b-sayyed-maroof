import { listAirports } from "@/lib/api/content";
import { cn } from "@/lib/utils";

type RouteMapProps = {
  pairs?: { from: string; to: string }[];
  className?: string;
  label?: string;
};

/** Schematic Europe. Arcs are dotted and animated, with no map tiles. */
export function RouteMap({
  pairs = [
    { from: "MAD", to: "LIS" },
    { from: "CDG", to: "FCO" },
    { from: "BER", to: "BCN" },
  ],
  className,
  label = "Schematic map of sample routes across Europe",
}: RouteMapProps) {
  const airports = listAirports();
  const byCode = new Map(airports.map((airport) => [airport.code, airport]));

  return (
    <svg viewBox="0 0 100 72" className={cn("h-full w-full", className)} role="img" aria-label={label}>
      <ellipse cx="48" cy="38" rx="34" ry="20" className="fill-ink/10" />
      <ellipse cx="30" cy="30" rx="14" ry="10" className="fill-ink/8" />
      <ellipse cx="58" cy="34" rx="16" ry="12" className="fill-ink/8" />
      <ellipse cx="22" cy="24" rx="6" ry="4" className="fill-ink/10" />
      {pairs.map((pair) => {
        const from = byCode.get(pair.from);
        const to = byCode.get(pair.to);
        if (!from || !to) return null;
        const midX = (from.x + to.x) / 2;
        const midY = Math.min(from.y, to.y) - 10;
        return (
          <path
            key={`${pair.from}-${pair.to}`}
            d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
            fill="none"
            className="route-arc stroke-accent"
            strokeWidth="0.6"
          />
        );
      })}
      {airports.map((airport) => (
        <g key={airport.code}>
          <circle cx={airport.x} cy={airport.y} r="0.9" className="fill-ink" />
        </g>
      ))}
    </svg>
  );
}
