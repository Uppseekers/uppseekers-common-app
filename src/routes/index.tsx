import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, FlaskConical, Lightbulb, Star } from "lucide-react";
import { SiteLayout, CtaButtons, seo } from "@/components/site/SiteShell";
import { ImageSplit, MeritNote, UniversityLogos, FormSection } from "@/components/site/EnquiryForm";
import team from "@/assets/internship-team.jpg";
import lab from "@/assets/research-lab.jpg";
import p1 from "@/assets/t-parent1.jpg";
import s1 from "@/assets/t-student1.jpg";
import s2 from "@/assets/t-student2.jpg";

const testimonials = [
  { img: p1, name: "Meera Iyer", role: "Parent, Class 11 student, Mumbai", q: "The mentors understood my daughter's interests and turned them into real projects. We finally had a clear plan for applications." },
  { img: s1, name: "Arjun Mehta", role: "Student, Class 12, Navi Mumbai", q: "My research mentor pushed me to ask better questions. Finishing a full paper gave me confidence and something real to write about." },
  { img: s2, name: "Ananya Rao", role: "Student, Class 10, Pune", q: "The internship sprint was hands-on from day one. I learnt more in a few weeks than I expected, and loved the small cohort." },
];

export const Route = createFileRoute("/")({
  head: () => seo(
    "Uppseekers — Internships, Research Mentorship & Admissions Guidance",
    "Experiential profile building for ambitious students: Alpha Internships, Alpha Research mentorship, passion projects and a 6-stage admissions roadmap.",
  ),
  component: Home,
});

const pillars = [
  { icon: Briefcase, title: "Alpha Internships", to: "/alpha-internships", text: "Real-world Skill Sprint and Skill Immersion programs that turn interest into demonstrated experience." },
  { icon: FlaskConical, title: "Alpha Research", to: "/alpha-research", text: "One-on-one research mentorship, from first question to a finished, publishable paper." },
  { icon: Lightbulb, title: "Passion Projects", to: "/passion-projects", text: "A capstone incubator that helps students build original projects with real impact." },
] as const;

const roadmap = [
  { t: "Diagnose", d: "Benchmark your profile with our Common Admission App." },
  { t: "Discover", d: "Identify your academic spike and target majors." },
  { t: "Build", d: "Internships, research and passion projects that prove it." },
  { t: "Shortlist", d: "Balanced Safe, Target and Dream university list." },
  { t: "Write", d: "Essays and applications that tell one coherent story." },
  { t: "Decide", d: "Interviews, offers and final enrolment decisions." },
];

function Home() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-20 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" /> 4.7 on Google Reviews
          </p>
          <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight text-foreground">
            Build a profile <span className="text-primary">universities remember.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Experiential profile building through real internships, research mentorship and passion projects, guided by a clear admissions roadmap.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3"><CtaButtons /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center">Experiential profile building</h2>
        <p className="mt-3 text-center text-muted-foreground">Three programs. One goal: proof of who you are.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <Link key={p.to} to={p.to} className="group rounded-2xl border border-border bg-card p-7 shadow-card hover:border-primary transition">
              <p.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              <span className="mt-5 inline-block text-sm font-medium text-primary group-hover:underline">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="roadmap" className="bg-secondary border-y border-border scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center">The 6-stage admissions roadmap</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((s, i) => (
              <div key={s.t} className="rounded-2xl bg-card border border-border p-6">
                <span className="text-sm font-semibold text-primary">Stage {i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ImageSplit img={team} alt="Students collaborating with a mentor" title="Why experiential profile building?">
        <p>Good grades are expected. What sets an application apart is evidence: work a student has actually done, problems they have solved and ideas they have followed through.</p>
        <p>Uppseekers helps students in Classes 7 to 12+ build that evidence step by step, with mentors who guide every stage, from first internship to final application.</p>
      </ImageSplit>

      <ImageSplit reverse img={lab} alt="Student researching with a mentor" title="Mentorship that goes deep">
        <p>Every student gets personal attention. Small cohorts mean mentors know each student's goals, strengths and progress.</p>
        <p>Our approach is led by Sriram Sekhar (NIT Surat, IIM Bangalore) and a team of experienced advisors.</p>
      </ImageSplit>

      <MeritNote />

      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-6 md:grid-cols-3 text-center">
        {[["4.7★", "Google Reviews"], ["4.3★", "Student rating"], ["9", "Students per track, per month"]].map(([n, l]) => (
          <div key={l} className="rounded-2xl border border-border p-8">
            <p className="text-4xl font-semibold text-primary">{n}</p>
            <p className="mt-2 text-sm text-muted-foreground">{l}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center">What families say</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-7 shadow-card">
              <div className="flex gap-1">{[0,1,2,3,4].map((i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}</div>
              <blockquote className="mt-4 text-sm text-muted-foreground">"{t.q}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img src={t.img} alt={t.name} width={48} height={48} loading="lazy" className="h-12 w-12 rounded-full object-cover" />
                <div><p className="font-semibold text-sm">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <UniversityLogos />
      <FormSection />

      <section className="mx-auto max-w-4xl px-4 text-center">
        <div className="rounded-3xl bg-navy text-navy-foreground p-12">
          <h2 className="text-3xl font-semibold">Know where you stand before you apply.</h2>
          <p className="mt-3 text-navy-foreground/70">Start with the free Common Admission App diagnostic, then talk to an advisor.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3"><CtaButtons /></div>
        </div>
      </section>
    </SiteLayout>
  );
}
