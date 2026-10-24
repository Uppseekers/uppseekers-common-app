import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero, CtaButtons, Card, seo } from "@/components/site/SiteShell";
import { ImageSplit, MeritNote, Steps, UniversityLogos, FormSection } from "@/components/site/EnquiryForm";
import lab from "@/assets/research-lab.jpg";
import paper from "@/assets/research-paper.jpg";

export const Route = createFileRoute("/alpha-research")({
  head: () => seo("Alpha Research Mentorship — Uppseekers", "One-on-one research mentorship for high-school students: Junior Navigator and Advanced Scholar tracks. Merit-based enrolment."),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Alpha Research" title="From curiosity to a finished paper." subtitle="One-on-one research mentorship that teaches students to ask good questions and answer them rigorously.">
        <CtaButtons />
      </PageHero>

      <ImageSplit img={lab} alt="Student working with a research mentor in a lab" title="Why research matters for admissions">
        <p>Top universities look for students who go beyond the syllabus. A research paper shows intellectual curiosity, independent thinking and the ability to finish a demanding piece of work.</p>
        <p>With Alpha Research, each student is paired with a mentor who guides them from picking a question to writing and presenting their findings.</p>
      </ImageSplit>

      <MeritNote />

      <section className="mx-auto max-w-5xl px-4 py-16 grid gap-6 md:grid-cols-2">
        <Card title="Junior Navigator" badge="Foundation track">
          <p>For students new to research. Learn how to choose a topic, read academic papers and write a structured research paper.</p>
          <ul className="list-disc pl-5"><li>Topic discovery sessions</li><li>Literature review training</li><li>Guided paper writing</li><li>Final presentation</li></ul>
        </Card>
        <Card title="Advanced Scholar" badge="Advanced track">
          <p>For students ready for original work. Deeper methods, real data analysis and a paper prepared for journal or competition submission.</p>
          <ul className="list-disc pl-5"><li>Original research question</li><li>Data collection and analysis</li><li>Publication-ready paper</li><li>Submission support</li></ul>
        </Card>
      </section>

      <Steps title="How the research journey works" items={[
        { t: "Find your question", d: "We match your interests to a research area with real depth." },
        { t: "Read and plan", d: "Study existing work and design a clear method." },
        { t: "Research and write", d: "Weekly mentor sessions keep the paper moving." },
        { t: "Publish and present", d: "Polish, submit and present your findings." },
      ]} />

      <ImageSplit reverse img={paper} alt="Student writing a research paper surrounded by journals" title="What students walk away with">
        <p>A complete research paper in their own name, a clear story for college essays, and a mentor who knows their work closely.</p>
        <p>Research areas include science, engineering, economics, psychology, environment, public policy and more.</p>
      </ImageSplit>

      <UniversityLogos />
      <FormSection />
    </SiteLayout>
  );
}
