"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/layout/section";
import { listFaqs } from "@/lib/api/content";

/** The questions people actually ask before they trust a lower fare. */
export function Faq() {
  const faqs = listFaqs();
  return (
    <Section id="faq" eyebrow="Questions" title="Before you flip anything.">
      <Accordion className="max-w-3xl border-t border-line">
        {faqs.map((item) => (
          <AccordionItem key={item.question} value={item.question} className="border-line">
            <AccordionTrigger className="min-h-11 py-4 text-base hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-ink-muted">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
