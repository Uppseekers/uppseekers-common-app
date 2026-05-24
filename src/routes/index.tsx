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
      { title: "Uppseekers — Common Admission App" },
      {
        name: "description",
        content:
          "Uppseekers Common Admission App — one profile that goes to an Uppseekers advisor for a personalized review and university path.",
      },
      { property: "og:title", content: "Uppseekers — Common Admission App" },
      { property: "og:description", content: "Build one applicant profile. Get matched with an Uppseekers advisor." },
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
