import type { Metadata } from "next";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { HackBento } from "@/components/landing/hack-bento";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PointsSection } from "@/components/landing/points-section";
import { ProofStrip } from "@/components/landing/proof";
import { Showcase } from "@/components/landing/showcase";
import { Stories } from "@/components/landing/stories";
import { TrustSection } from "@/components/landing/trust";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.tagline} Same trip, far less to pay`,
  description: siteConfig.descriptor,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <Showcase />
      <HowItWorks />
      <HackBento />
      <PointsSection />
      <TrustSection />
      <Stories />
      <Faq />
      <FinalCta />
    </>
  );
}
