import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero, CtaButtons, Card, seo } from "@/components/site/SiteShell";

export const Route = createFileRoute("/alpha-internships")({
  head: () => seo("Alpha Internships — Uppseekers", "Skill Sprint and Skill Immersion internships that give high-school students real-world, mentored work experience."),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Alpha Internships" title="Real work. Real mentors. Real proof." subtitle="Structured internships that let students apply what they learn and leave with work they can show.">
        <CtaButtons />
      </PageHero>
      <section className="mx-auto max-w-5xl px-4 py-16 grid gap-6 md:grid-cols-2">
        <Card title="Skill Sprint" badge="Short format">
          <p>A focused, high-intensity program to build one practical skill and ship a tangible deliverable.</p>
          <ul className="list-disc pl-5"><li>Mentor-led weekly sessions</li><li>Defined project outcome</li><li>Completion feedback</li></ul>
        </Card>
        <Card title="Skill Immersion" badge="Extended format">
          <p>A deeper engagement where students work on a substantial real-world problem over a longer period.</p>
          <ul className="list-disc pl-5"><li>One-on-one mentorship</li><li>Portfolio-grade output</li><li>Recommendation-ready performance review</li></ul>
        </Card>
      </section>
    </SiteLayout>
  );
}
