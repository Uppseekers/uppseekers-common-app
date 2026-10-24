import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero, CtaButtons, seo } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about-us")({
  head: () => seo("About Uppseekers — Leadership & Mission", "Meet Uppseekers, led by Director Sriram Sekhar (NIT Surat, IIM Bangalore)."),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="About Us" title="Helping students rise, one proof point at a time." subtitle="Uppseekers combines real-world experience, research mentorship and strategic admissions guidance.">
        <CtaButtons />
      </PageHero>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card md:flex gap-8 items-center">
          <div className="h-28 w-28 shrink-0 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-semibold text-primary-foreground">SS</div>
          <div className="mt-6 md:mt-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Director</p>
            <h2 className="mt-1 text-2xl font-semibold">Sriram Sekhar</h2>
            <p className="text-sm text-muted-foreground">NIT Surat · IIM Bangalore</p>
            <p className="mt-4 text-muted-foreground">Sriram leads Uppseekers' mentorship and admissions strategy, helping students build authentic profiles through real work rather than checklists.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Our Vision</p>
          <h3 className="mt-2 text-xl font-semibold">Every ambitious student, ready for the world's best universities.</h3>
          <p className="mt-3 text-sm text-muted-foreground">We want students across India to reach top universities on the strength of real work, original thinking and a clear sense of purpose.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Our Core Mission</p>
          <h3 className="mt-2 text-xl font-semibold">Turn interest into evidence.</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Give students hands-on internships, research and passion projects.</li>
            <li>Offer close mentorship in small, merit-based cohorts.</li>
            <li>Guide families through a clear, honest admissions roadmap.</li>
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}
