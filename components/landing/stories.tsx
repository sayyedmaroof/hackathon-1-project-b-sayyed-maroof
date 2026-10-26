import { BoardingPassCard } from "@/components/fare/boarding-pass";
import { SampleNote } from "@/components/layout/sample-note";
import { Section } from "@/components/layout/section";
import { listTestimonials } from "@/lib/api/content";
import { formatSaving } from "@/lib/format";

/** Sample stories, styled as torn ticket stubs. */
export function Stories() {
  const stories = listTestimonials();
  return (
    <Section
      className="bg-surface"
      eyebrow="From the road"
      title="People who flipped a fare they were about to pay."
    >
      <SampleNote className="mb-6" />
      <div className="grid gap-4 lg:grid-cols-3">
        {stories.map((story) => (
          <BoardingPassCard
            key={story.id}
            stub={<p className="num text-saving">{formatSaving(story.saving)} saved</p>}
          >
            <p className="text-sm leading-relaxed">“{story.quote}”</p>
            <p className="mt-4 text-sm font-medium">{story.name}</p>
            <p className="text-xs text-ink-muted">{story.route}</p>
          </BoardingPassCard>
        ))}
      </div>
    </Section>
  );
}
