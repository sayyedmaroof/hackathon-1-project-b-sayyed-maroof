import { SearchCard } from "@/components/search/search-card";
import { Section } from "@/components/layout/section";

/** The same search, once more, after the argument has been made. */
export function FinalCta() {
  return (
    <Section
      className="border-t border-line"
      title={
        <>
          Your fare, <span className="italic">flipped.</span>
        </>
      }
      description="Start with the route you were already going to book."
    >
      <div className="max-w-xl">
        <SearchCard id="search-again" />
      </div>
    </Section>
  );
}
