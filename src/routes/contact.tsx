import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout, PageHero, seo } from "@/components/site/SiteShell";
import { submitLead } from "@/lib/leads.functions";

export const Route = createFileRoute("/contact")({
  head: () => seo("Book a Strategic Consultation — Uppseekers", "Tell us about the student and goals. An Uppseekers advisor will reach out for a diagnostic consultation."),
  component: Page,
});

const input = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

function Page() {
  const [f, setF] = useState({ name: "", email: "", phone: "", grade: "", interest: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="Book a strategic consultation." subtitle="Share a few details and an advisor will reach out to plan the right next step." />
      <section className="mx-auto max-w-2xl px-4 py-16">
        {done ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
            <h2 className="text-2xl font-semibold">Thank you!</h2>
            <p className="mt-2 text-muted-foreground">Our team will contact you shortly.</p>
          </div>
        ) : (
          <form
            className="rounded-2xl border border-border bg-card p-8 shadow-card grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email) || !/^[+\d\s()-]{7,20}$/.test(f.phone)) {
                return toast.error("Please enter your name, a valid email and phone number.");
              }
              setBusy(true);
              try { await submitLead({ data: { kind: "consultation", ...f } }); setDone(true); }
              catch { toast.error("Could not send. Please email team@uppseekers.com."); }
              finally { setBusy(false); }
            }}
          >
            <input className={input} placeholder="Full name *" value={f.name} onChange={set("name")} maxLength={100} />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className={input} type="email" placeholder="Email *" value={f.email} onChange={set("email")} maxLength={255} />
              <input className={input} type="tel" placeholder="Phone *" value={f.phone} onChange={set("phone")} maxLength={20} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select className={input} value={f.grade} onChange={set("grade")}>
                <option value="">Current grade</option>
                {["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Gap year"].map((g) => <option key={g}>{g}</option>)}
              </select>
              <select className={input} value={f.interest} onChange={set("interest")}>
                <option value="">Interested in</option>
                {["Alpha Internships", "Alpha Research", "Passion Projects", "Admissions guidance"].map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <textarea className={input} rows={5} placeholder="Goals, target universities, questions…" value={f.message} onChange={set("message")} maxLength={2000} />
            <button disabled={busy} className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-60">
              {busy ? "Sending…" : "Request Consultation"}
            </button>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}
