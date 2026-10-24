import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero, CtaButtons, Card, seo } from "@/components/site/SiteShell";

export const Route = createFileRoute("/alpha-research")({
  head: () => seo("Alpha Research Mentorship — Uppseekers", "Research mentorship for students: Junior Navigator ($699) and Advanced Scholar ($1,299) tracks."),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Alpha Research" title="From curiosity to a finished paper." subtitle="One-on-one research mentorship that teaches students to ask good questions and answer them rigorously.">
        <CtaButtons />
      </PageHero>
      <section className="mx-auto max-w-5xl px-4 py-16 grid gap-6 md:grid-cols-2">
        <Card title="Junior Navigator — $699" badge="Foundation">
          <p>For students new to research: choosing a topic, reading literature and producing a structured research paper.</p>
        </Card>
        <Card title="Advanced Scholar — $1,299" badge="Advanced">
          <p>For students ready for original work: deeper methodology, data analysis and a paper prepared for submission.</p>
        </Card>
      </section>
    </SiteLayout>
  );
}
