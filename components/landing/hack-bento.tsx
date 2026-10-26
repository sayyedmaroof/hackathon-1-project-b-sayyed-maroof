import Link from "next/link";
import { Section } from "@/components/layout/section";
import { listHacks } from "@/lib/api/content";
import { cn } from "cn";

const spans: Record<string, string> = {
  "flexible-dates": "md:col-span-2 md:row-span-2",
  "nearby-airports": "md:col-span-2",
  "split-ticket": "md:col-span-2",
  stopover: "md:col-span-2",
  miles: "md:col-span-2",
  "transfer-partner": "md:col-span-2",
};

/** Uneven gallery. Each tile is a different hack, not a repeated card. */
export function HackBento() {
  const hacks = listHacks();
  return (
    <Section
      eyebrow="The hacks"
      title="Six ways a fare comes down."
      description="Plain language, a typical saving, and the risk that comes with it."
    >
      <div className="grid gap-3 md:grid-cols-4">
        {hacks.map((hack) => (
          <Link
            key={hack.slug}
            href={`/hacks/${hack.slug}`}
            className={cn(
              "group flex min-h-44 flex-col justify-between rounded-[24px] border border-line bg-surface p-5 transition-transform duration-300 hover:-translate-y-1",
              spans[hack.slug],
            )}
          >
            <div>
              <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">{hack.difficulty}</p>
              <h3 className="mt-2 font-display text-3xl tracking-tight group-hover:italic">
                {hack.name}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-ink-muted">{hack.summary}</p>
            </div>
            {hack.slug === "flexible-dates" ? <HeatPreview /> : null}
            {hack.slug === "nearby-airports" ? <DotPreview /> : null}
            <p className="num mt-6 text-sm text-saving">{hack.typicalSaving}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function HeatPreview() {
  const tones = ["bg-line", "bg-saving/20", "bg-saving/40", "bg-saving/70", "bg-line", "bg-saving/30", "bg-saving/50"];
  return (
    <div className="mt-6 grid grid-cols-7 gap-1" aria-hidden="true">
      {tones.map((tone, index) => (
        <span key={index} className={cn("h-8 rounded-md", tone)} />
      ))}
    </div>
  );
}

function DotPreview() {
  return (
    <svg viewBox="0 0 120 48" className="mt-4 h-12 w-full" aria-hidden="true">
      <path d="M10 30 Q 60 4 110 28" fill="none" className="stroke-accent" strokeDasharray="3 3" />
      <circle cx="10" cy="30" r="3" className="fill-ink" />
      <circle cx="110" cy="28" r="3" className="fill-accent" />
    </svg>
  );
}
