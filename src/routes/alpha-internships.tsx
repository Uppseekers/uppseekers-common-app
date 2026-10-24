import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero, CtaButtons, Card, seo } from "@/components/site/SiteShell";
import { ImageSplit, MeritNote, Steps, UniversityLogos, FormSection } from "@/components/site/EnquiryForm";
import team from "@/assets/internship-team.jpg";

export const Route = createFileRoute("/alpha-internships")({
  head: () => seo("Alpha Internships — Uppseekers", "Skill Sprint and Skill Immersion internships that give high-school students real-world, mentored work experience. Merit-based enrolment."),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Alpha Internships" title="Real work. Real mentors. Real proof." subtitle="Structured internships that let students apply what they learn and leave with work they can show.">
        <CtaButtons />
      </PageHero>

      <ImageSplit img={team} alt="Student interns working with a mentor" title="What is an Alpha Internship?">
        <p>Alpha Internships place students on real projects guided by industry mentors. Instead of watching from the side, students take ownership of a task, solve problems and deliver results.</p>
        <p>It's the kind of experience that stands out on a college application, because it proves skills rather than just listing them.</p>
      </ImageSplit>

      <MeritNote />

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

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center">Domains you can work in</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["Business & Marketing", "Finance", "Data Science", "Coding & AI", "Design", "Psychology", "Biotech", "Sustainability", "Law & Policy", "Media"].map((d) => (
            <span key={d} className="rounded-full border border-border bg-card px-4 py-2 text-sm">{d}</span>
          ))}
        </div>
      </section>

      <Steps title="How it works" items={[
        { t: "Apply", d: "Share your interests. Every application is reviewed on merit." },
        { t: "Get matched", d: "We pair you with a mentor and a real project." },
        { t: "Do the work", d: "Weekly check-ins, clear goals and honest feedback." },
        { t: "Show the proof", d: "Finish with a deliverable and a performance review." },
      ]} />

      <UniversityLogos />
      <FormSection />
    </SiteLayout>
  );
}
