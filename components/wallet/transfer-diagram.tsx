import { listPrograms, listTransfers } from "@/lib/api/content";

/** Bank points flowing into airline programs, with the ratio on the line. */
export function TransferDiagram() {
  const programs = listPrograms();
  const links = listTransfers();
  const byId = new Map(programs.map((program) => [program.id, program.name]));

  return (
    <div className="rounded-[24px] border border-line bg-surface p-5">
      <h2 className="font-display text-3xl tracking-tight">Where points can move</h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={`${link.fromId}-${link.toId}`} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border border-line px-3 py-2">{byId.get(link.fromId)}</span>
            <span className="text-ink-muted" aria-hidden="true">
              →
            </span>
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-2">
              {byId.get(link.toId)}
            </span>
            <span className="num text-ink-muted">{link.ratio}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink-muted">Transfers in this preview are illustrations, not live links.</p>
    </div>
  );
}
