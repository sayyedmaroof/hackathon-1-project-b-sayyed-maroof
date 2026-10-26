import { Section } from "@/components/layout/section";
import { listSteps } from "@/lib/api/content";

const drawings = [
  <svg key="enter" viewBox="0 0 80 64" className="h-16 w-20 text-ink" aria-hidden="true">
    <rect x="8" y="14" width="64" height="36" rx="8" fill="none" stroke="currentColor" />
    <path d="M18 28h28M18 36h16" stroke="currentColor" strokeLinecap="round" />
    <circle cx="58" cy="32" r="6" className="fill-accent" />
  </svg>,
  <svg key="find" viewBox="0 0 80 64" className="h-16 w-20 text-ink" aria-hidden="true">
    <path d="M10 44c12-20 18-20 30 0s18 20 30 0" fill="none" stroke="currentColor" strokeDasharray="3 3" />
    <circle cx="24" cy="28" r="4" className="fill-ink" />
    <circle cx="56" cy="22" r="4" className="fill-accent" />
  </svg>,
  <svg key="book" viewBox="0 0 80 64" className="h-16 w-20 text-ink" aria-hidden="true">
    <rect x="16" y="10" width="48" height="44" rx="8" fill="none" stroke="currentColor" />
    <path d="M16 28h48" stroke="currentColor" strokeDasharray="3 3" />
    <path d="M28 40h12" className="stroke-saving" strokeWidth="2" strokeLinecap="round" />
  </svg>,
];

/** Three steps, each with a drawn mark instead of an icon pack illustration. */
export function HowItWorks() {
  const steps = listSteps();
  return (
    <Section
      id="how-it-works"
      className="border-y border-line bg-surface"
      eyebrow="How it works"
      title="Three moves. Then a fare you can trust."
    >
      <ol className="grid gap-10 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.id}>
            {drawings[index]}
            <p className="num mt-4 text-xs text-ink-muted">0{index + 1}</p>
            <h3 className="mt-1 font-display text-3xl tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
