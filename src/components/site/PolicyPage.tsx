import type { PolicySection } from "@/content/privacy";
import { SiteLayout } from "@/components/site/SiteShell";

const bold = (s: string) =>
  s.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <strong key={i} className="text-foreground">{p}</strong> : p));

export function PolicyPage({ title, sections }: { title: string; sections: PolicySection[] }) {
  return (
    <SiteLayout>
      <section className="bg-secondary min-h-full">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <article className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-card">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Brand: Uppseekers · Effective Date: 2026</p>
            {sections.map((s) => (
              <div key={s.title} className="mt-8">
                <h2 className="text-lg font-semibold">{s.title}</h2>
                {s.paragraphs.map((p, i) => <p key={i} className="mt-2 text-sm leading-relaxed text-muted-foreground">{bold(p)}</p>)}
                {s.bullets.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                    {s.bullets.map((b, i) => <li key={i}>{bold(b)}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </article>
        </div>
      </section>
    </SiteLayout>
  );
}
