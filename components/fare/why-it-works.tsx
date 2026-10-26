/** One plain sentence on why this fare is lower. */
export function WhyItWorks({ text }: { text: string }) {
  return (
    <p className="text-sm leading-relaxed text-ink-muted">
      <span className="font-medium text-ink">Why this works. </span>
      {text}
    </p>
  );
}
