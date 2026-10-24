import { useState } from "react";
import { toast } from "sonner";
import { submitLead } from "@/lib/leads.functions";

const input = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
const classes = ["7", "8", "9", "10", "11", "12", "12+"];
const boards = ["CBSE", "ICSE/ISC", "State Board", "IB/CIE", "IGCSE", "Others"];
const empty = { who: "", name: "", phone: "", email: "", studentClass: "", board: "", interest: "", message: "" };

export function EnquiryForm({ compact = false }: { compact?: boolean }) {
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  if (done) return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
      <h3 className="text-2xl font-semibold">Thank you!</h3>
      <p className="mt-2 text-muted-foreground">Our team will contact you shortly.</p>
    </div>
  );

  return (
    <form
      className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card grid gap-4 text-left"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.who || !f.name.trim() || !/^[+\d\s()-]{7,20}$/.test(f.phone) || !/^\S+@\S+\.\S+$/.test(f.email) || !f.studentClass || !f.board) {
          return toast.error("Please fill in all required fields with valid details.");
        }
        setBusy(true);
        try { await submitLead({ data: { kind: "consultation", ...f } }); setDone(true); }
        catch { toast.error("Could not send. Please email team@uppseekers.com."); }
        finally { setBusy(false); }
      }}
    >
      <div>
        <h3 className="text-xl font-semibold">Contact us</h3>
        <p className="mt-1 text-sm text-muted-foreground">Enrolment is on a merit basis only. Share your details and an advisor will reach out.</p>
      </div>
      <fieldset>
        <legend className="text-sm font-medium mb-2">Who are you? *</legend>
        <div className="flex gap-3">
          {["Parent", "Student"].map((w) => (
            <label key={w} className={`flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-sm text-center transition ${f.who === w ? "border-primary bg-primary/10 font-medium" : "border-input"}`}>
              <input type="radio" name="who" value={w} checked={f.who === w} onChange={set("who")} className="sr-only" />{w}
            </label>
          ))}
        </div>
      </fieldset>
      <input className={input} placeholder="Parent name *" value={f.name} onChange={set("name")} maxLength={100} />
      <div className="grid gap-4 sm:grid-cols-2">
        <input className={input} type="tel" placeholder="Parent mobile number *" value={f.phone} onChange={set("phone")} maxLength={20} />
        <input className={input} type="email" placeholder="Parent email ID *" value={f.email} onChange={set("email")} maxLength={255} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <select className={input} value={f.studentClass} onChange={set("studentClass")}>
          <option value="">Student class *</option>
          {classes.map((c) => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <select className={input} value={f.board} onChange={set("board")}>
          <option value="">School board *</option>
          {boards.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      {!compact && (
        <>
          <select className={input} value={f.interest} onChange={set("interest")}>
            <option value="">Interested in</option>
            {["Alpha Internships", "Alpha Research", "Passion Projects", "Admissions guidance"].map((g) => <option key={g}>{g}</option>)}
          </select>
          <textarea className={input} rows={4} placeholder="Goals, target universities, questions…" value={f.message} onChange={set("message")} maxLength={2000} />
        </>
      )}
      <button disabled={busy} className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-60">
        {busy ? "Sending…" : "Contact Us"}
      </button>
    </form>
  );
}

const unis = [
  ["Harvard", "harvard.edu"], ["Stanford", "stanford.edu"], ["MIT", "mit.edu"], ["Oxford", "ox.ac.uk"],
  ["Cambridge", "cam.ac.uk"], ["Yale", "yale.edu"], ["Princeton", "princeton.edu"], ["Columbia", "columbia.edu"],
  ["UC Berkeley", "berkeley.edu"], ["Imperial", "imperial.ac.uk"], ["U Toronto", "utoronto.ca"], ["NUS", "nus.edu.sg"],
  ["UCL", "ucl.ac.uk"], ["Cornell", "cornell.edu"], ["UPenn", "upenn.edu"], ["Carnegie Mellon", "cmu.edu"],
];

export function UniversityLogos({ title = "Where our students aim — and get in" }: { title?: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center">{title}</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">Top universities across the US, UK, Canada and Asia.</p>
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {unis.map(([n, d]) => (
          <div key={d} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4">
            <img src={`https://www.google.com/s2/favicons?domain=${d}&sz=128`} alt={`${n} logo`} width={48} height={48} loading="lazy" className="h-12 w-12 object-contain" />
            <span className="text-xs font-medium text-center">{n}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MeritNote() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="rounded-2xl border border-warning/40 bg-warning/10 px-6 py-4 text-sm text-foreground text-center">
        <strong>Enrolment is on a merit basis only.</strong> Every applicant is reviewed, and seats are limited to 9 students per track each month.
      </div>
    </div>
  );
}

export function ImageSplit({ img, alt, title, children, reverse = false }: { img: string; alt: string; title: string; children: React.ReactNode; reverse?: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 grid gap-10 md:grid-cols-2 items-center">
      <img src={img} alt={alt} width={1280} height={864} loading="lazy" className={`rounded-2xl shadow-card w-full h-auto object-cover ${reverse ? "md:order-2" : ""}`} />
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
        <div className="mt-4 space-y-3 text-muted-foreground">{children}</div>
      </div>
    </section>
  );
}

export function Steps({ title, items }: { title: string; items: { t: string; d: string }[] }) {
  return (
    <section className="bg-secondary border-y border-border">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center">{title}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <div key={s.t} className="rounded-2xl bg-card border border-border p-6">
              <span className="text-sm font-semibold text-primary">Step {i + 1}</span>
              <h3 className="mt-2 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FormSection() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16" id="contact-form">
      <EnquiryForm compact />
    </section>
  );
}
