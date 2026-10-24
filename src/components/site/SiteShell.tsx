import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, Star, X, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/uppseekers-logo.png.asset.json";
import { submitLead } from "@/lib/leads.functions";

export function Logo({ className = "h-9 md:h-10 w-auto object-contain" }: { className?: string }) {
  return <img src={logo.url} alt="Uppseekers" className={className} />;
}

const nav = [
  { to: "/alpha-internships", label: "Alpha Internships" },
  { to: "/alpha-research", label: "Alpha Research" },
  { to: "/passion-projects", label: "Passion Projects" },
  { to: "/about-us", label: "About Us" },
] as const;

function AnnouncementBar() {
  return (
    <div className="bg-navy text-navy-foreground text-xs sm:text-sm">
      <div className="mx-auto max-w-7xl px-4 py-2 text-center">
        ⚡ Limited to 9 participants each month per track to ensure dedicated mentorship.{" "}
        <Link to="/contact" className="font-semibold text-warning hover:underline">
          Apply for Next Cohort →
        </Link>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const linkCls = "text-sm text-muted-foreground hover:text-foreground transition";
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" aria-label="Uppseekers home"><Logo /></Link>
        <nav className="hidden lg:flex items-center gap-6">
          {nav.slice(0, 3).map((n) => (
            <Link key={n.to} to={n.to} className={linkCls} activeProps={{ className: "text-foreground font-medium" }}>{n.label}</Link>
          ))}
          <Link to="/" hash="roadmap" className={linkCls}>Admissions Roadmap</Link>
          <Link to="/about-us" className={linkCls} activeProps={{ className: "text-foreground font-medium" }}>About Us</Link>
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/app" className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition">Diagnostic App</Link>
          <Link to="/contact" className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition">Book Consultation</Link>
        </div>
        <button className="lg:hidden p-2" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border px-4 py-4 flex flex-col gap-3 bg-background">
          {nav.map((n) => <Link key={n.to} to={n.to} className={linkCls} onClick={() => setOpen(false)}>{n.label}</Link>)}
          <Link to="/" hash="roadmap" className={linkCls} onClick={() => setOpen(false)}>Admissions Roadmap</Link>
          <div className="flex gap-2 pt-2">
            <Link to="/app" className="flex-1 text-center rounded-full border border-border px-4 py-2 text-sm">Diagnostic App</Link>
            <Link to="/contact" className="flex-1 text-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm">Book Consultation</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Callback() {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!/^[+\d\s()-]{7,20}$/.test(phone.trim())) return toast.error("Please enter a valid phone number");
        setBusy(true);
        try {
          await submitLead({ data: { kind: "callback", phone } });
          toast.success("Thanks! Our team will call you shortly.");
          setPhone("");
        } catch {
          toast.error("Could not send. Please email team@uppseekers.com.");
        } finally { setBusy(false); }
      }}
    >
      <input
        type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter Phone Number"
        className="rounded-lg bg-navy-foreground/10 border border-navy-foreground/20 px-3 py-2 text-sm placeholder:text-navy-foreground/50 outline-none focus:border-primary"
      />
      <button disabled={busy} className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
        {busy ? "Sending…" : "Get Guidance"}
      </button>
    </form>
  );
}

function SiteFooter() {
  const l = "text-sm text-navy-foreground/70 hover:text-navy-foreground transition";
  return (
    <footer className="bg-navy text-navy-foreground mt-24">
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-block rounded-lg bg-background px-3 py-2"><Logo /></div>
          <p className="mt-4 text-sm text-navy-foreground/70">
            Empowering students to achieve their educational dreams through real-world internships, research mentorship, and strategic admissions guidance.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-navy-foreground/10 px-3 py-1"><Star className="h-3 w-3 fill-warning text-warning" /> 4.7 Google Reviews</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-navy-foreground/10 px-3 py-1"><Star className="h-3 w-3 fill-warning text-warning" /> 4.3 Student rating</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Programs</h4>
          <ul className="space-y-2">
            {nav.map((n) => <li key={n.to}><Link to={n.to} className={l}>{n.label}</Link></li>)}
            <li><Link to="/app" className={l}>Diagnostic App</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <p className={`${l} flex gap-2`}><Mail className="h-4 w-4 mt-0.5 shrink-0" /> team@uppseekers.com</p>
          <p className={`${l} flex gap-2 mt-3`}><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> Navi Mumbai / Mumbai Metropolitan Region, Maharashtra, India</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Callback</h4>
          <Callback />
        </div>
      </div>
      <div className="border-t border-navy-foreground/10">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row justify-between gap-3 text-xs text-navy-foreground/60">
          <p>© 2026 Uppseekers. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-navy-foreground">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-navy-foreground">Terms</Link>
            <Link to="/refund-policy" className="hover:text-navy-foreground">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children?: ReactNode }) {
  return (
    <section className="bg-secondary border-b border-border">
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function CtaButtons() {
  return (
    <>
      <Link to="/contact" className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90">Book Consultation</Link>
      <Link to="/app" className="rounded-full border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-muted">Try the Diagnostic App</Link>
    </>
  );
}

export function Card({ title, children, badge }: { title: string; children: ReactNode; badge?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
      {badge && <span className="inline-block mb-3 rounded-full bg-warning/15 text-foreground px-3 py-1 text-xs font-semibold">{badge}</span>}
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <div className="mt-3 text-sm text-muted-foreground space-y-2">{children}</div>
    </div>
  );
}

export function seo(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
