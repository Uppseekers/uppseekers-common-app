import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero, CtaButtons, Card, seo } from "@/components/site/SiteShell";

export const Route = createFileRoute("/passion-projects")({
  head: () => seo("Passion Projects & Capstone Incubator — Uppseekers", "Turn an idea into an original, impactful capstone project with mentorship from Uppseekers."),
  component: Page,
});

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
    </SiteLayout>
  );
}
