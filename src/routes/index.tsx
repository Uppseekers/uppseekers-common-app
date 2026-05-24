import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Features } from "@/components/site/Features";
import { Universities } from "@/components/site/Universities";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AdmitIQ AI — Know where you stand before you apply" },
      {
        name: "description",
        content:
          "AdmitIQ AI evaluates your academic, extracurricular, and essay profile to predict your admission chances at top global universities.",
      },
      { property: "og:title", content: "AdmitIQ AI — Admissions intelligence for ambitious students" },
      { property: "og:description", content: "AI-powered profile scoring & university match for undergraduate admissions." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Universities />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
