import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Features } from "@/components/site/Features";
import { Universities } from "@/components/site/Universities";
import { CTA } from "@/components/site/CTA";
import { SiteLayout, seo } from "@/components/site/SiteShell";

export const Route = createFileRoute("/app")({
  head: () => seo(
    "Common Admission App — Uppseekers Diagnostic",
    "Build one applicant profile, get benchmarked against 77 universities, and receive an advisor-reviewed report from Uppseekers.",
  ),
  component: AppLanding,
});

function AppLanding() {
  return (
    <SiteLayout>
      <Hero />
      <HowItWorks />
      <Features />
      <Universities />
      <CTA />
    </SiteLayout>
  );
}
