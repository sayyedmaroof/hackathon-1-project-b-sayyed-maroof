import { RiskLabel } from "@/components/fare/risk-label";
import { Section } from "@/components/layout/section";
import { SampleNote } from "@/components/layout/sample-note";

const lines = [
  { label: "Fare", amount: 142, width: "58%" },
  { label: "Bags", amount: 28, width: "14%" },
  { label: "Ground", amount: 18, width: "12%" },
  { label: "Taxes", amount: 32, width: "16%" },
];

/** The differentiator: the real total, and a risk word that means something. */
export function TrustSection() {
  return (
    <Section
      id="trust"
      eyebrow="Honest by design"
      title="We show the real price, not the flattering one."
      description="A fare that forgets the bag and the train is a story. The total is the number you can spend."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-line bg-surface p-6">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-3xl">True total</h3>
            <p className="num text-2xl">220 €</p>
          </div>
          <div className="mt-6 flex h-4 overflow-hidden rounded-full" aria-hidden="true">
            <span className="h-full bg-ink" style={{ width: "58%" }} />
            <span className="h-full bg-accent" style={{ width: "14%" }} />
            <span className="h-full bg-warn" style={{ width: "12%" }} />
            <span className="h-full bg-ink-muted" style={{ width: "16%" }} />
          </div>
          <ul className="mt-5 space-y-2">
            {lines.map((line) => (
              <li key={line.label} className="flex justify-between text-sm">
                <span>{line.label}</span>
                <span className="num">{line.amount} €</span>
              </li>
            ))}
          </ul>
          <SampleNote className="mt-4" />
        </div>
        <div className="space-y-4">
          {(["low", "medium", "high"] as const).map((risk) => (
            <div key={risk} className="rounded-[20px] border border-line p-4">
              <RiskLabel risk={risk} />
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {risk === "low" && "Change the day or the airport. You still hold one ticket."}
                {risk === "medium" && "Two tickets, or a night in a hub. A missed connection is not protected."}
                {risk === "high" && "Points leave your account and do not come back if the seat is gone."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
