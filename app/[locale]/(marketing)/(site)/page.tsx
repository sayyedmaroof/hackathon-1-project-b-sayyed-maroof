import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: siteConfig.tagline,
  description: siteConfig.descriptor,
};

export default function HomePage() {
  return <LandingPage />;
}
