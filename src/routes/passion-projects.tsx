import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { SiteLayout, PageHero, CtaButtons, Card, seo } from "@/components/site/SiteShell";
import { FormSection } from "@/components/site/EnquiryForm";

export const Route = createFileRoute("/passion-projects")({
  head: () => seo("Passion Projects & Capstone Incubator — Uppseekers", "See real student-built projects like PostureGuard AI, ZeroWaste Pro and HomeEquity from the Uppseekers capstone incubator."),
  component: Page,
});

const projects = [
  {
    name: "PostureGuard AI", url: "https://posture-guide-prototype.uppseekers.com/",
    points: [
      ["Real-Time AI Posture Vision", "Automatically monitors spinal alignment and shoulder positioning in real-time via your webcam, delivering privacy-first instant feedback so you maintain a healthy workspace posture."],
      ["Personalized Ergonomic Coaching", "Provides intelligent break reminders, dynamic stretch routines, and custom alert thresholds tailored to your daily workflow to prevent fatigue and long-term strain."],
      ["Inspiring Founders", "Proudly founded by 16-year-old Navya and Aditya, perfectly merging smart technology with a passion for family health and social good."],
    ],
  },
  {
    name: "ZeroWaste Pro", url: "https://undergrad.uppseekers.com/project-2/",
    points: [
      ["Smart Inventory Tracking", "Automatically monitors your grocery expiry dates and prices so you never lose track of your stock."],
      ["Intelligent Recipe Suggestions", "Provides real-time recommendations on what meals to prepare or ingredients to utilize next to ensure zero wastage."],
      ["Inspiring Founders", "Proudly founded by 13-year-old interns, Rohan (Gurgaon) and Kavya (Mumbai), perfectly merging smart technology with a passion for social good."],
    ],
  },
  {
    name: "HomeEquity", url: "https://undergrad.uppseekers.com/project-1/",
    points: [
      ["Core Functionality", "Automatically calculates the most optimal home loan repayment strategy tailored to your specific financial situation."],
      ["Primary Benefit", "Helps you achieve the lowest possible total interest paid while effectively managing your monthly financial load."],
      ["Development Team", "Proudly designed and developed by Sara and Yuvraj, Interns in the Financial Services division."],
    ],
  },
];

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Passion Projects" title="Build something only you could build." subtitle="Our capstone incubator helps students take an idea from concept to launch with measurable impact.">
        <CtaButtons />
      </PageHero>
      <section className="mx-auto max-w-5xl px-4 py-16 grid gap-6 md:grid-cols-3">
        <Card title="Ideate"><p>Find a problem that matches your interests and intended major.</p></Card>
        <Card title="Incubate"><p>Plan milestones, build the project and test it with real users.</p></Card>
        <Card title="Showcase"><p>Document impact clearly for applications, essays and interviews.</p></Card>
      </section>
      <section className="bg-secondary border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center">Projects built by our students</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {projects.map((p) => (
              <article key={p.name} className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-card">
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <dl className="mt-4 space-y-4 flex-1">
                  {p.points.map(([t, d]) => (
                    <div key={t}><dt className="text-sm font-semibold text-primary">{t}</dt><dd className="mt-1 text-sm text-muted-foreground">{d}</dd></div>
                  ))}
                </dl>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90">
                  View Project <ExternalLink className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
      <FormSection />
    </SiteLayout>
  );
}
