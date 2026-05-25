import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Check, ChevronRight, GraduationCap, Info, Loader2, LogOut, Plus, RotateCw, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getMyProfile, saveSection, submitProfile, startRetry } from "@/lib/onboarding.functions";
import { SECTION_KEYS, type SectionKey } from "@/lib/onboarding-schema";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Your Application — Uppseekers" }] }),
  component: Onboarding,
});

const SECTIONS: { key: SectionKey; label: string; desc: string }[] = [
  { key: "personal", label: "Personal", desc: "Who you are" },
  { key: "academics", label: "Academics", desc: "School, GPA, courses" },
  { key: "testing", label: "Testing", desc: "SAT/ACT/AP/IELTS" },
  { key: "activities", label: "Activities", desc: "Up to 10 entries" },
  { key: "essays", label: "Essays", desc: "Drafts & prompts" },
  { key: "recommendations", label: "Recommenders", desc: "Teachers & counselors" },
  { key: "preferences", label: "Preferences", desc: "Majors & target list" },
];

type State = Record<SectionKey, any>;

function Onboarding() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const save = useServerFn(saveSection);
  const submit = useServerFn(submitProfile);
  const retry = useServerFn(startRetry);

  const [active, setActive] = useState<SectionKey>("personal");
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchProfile().then((p: any) => {
      setState({
        personal: p.personal ?? {},
        academics: p.academics ?? {},
        testing: p.testing ?? {},
        activities: Array.isArray(p.activities) ? p.activities : [],
        essays: p.essays ?? {},
        recommendations: Array.isArray(p.recommendations) ? p.recommendations : [],
        preferences: p.preferences ?? {},
      });
      if (p.status === "submitted") setSubmitted(true);
      setLoading(false);
    }).catch((e) => { toast.error(e.message); setLoading(false); });
  }, [fetchProfile]);

  const completion = useMemo(() => {
    if (!state) return 0;
    let filled = 0;
    SECTION_KEYS.forEach((k) => {
      const v = state[k];
      if (Array.isArray(v) ? v.length > 0 : v && Object.values(v).some((x) => x && String(x).trim()))
        filled++;
    });
    return Math.round((filled / SECTION_KEYS.length) * 100);
  }, [state]);

  const updateSection = (key: SectionKey, data: any) => {
    setState((s) => (s ? { ...s, [key]: data } : s));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save({ data: { section: key, data } }).catch((e) => toast.error(e.message));
    }, 700);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // flush pending save
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (state) {
        await Promise.all(
          SECTION_KEYS.map((k) => save({ data: { section: k, data: state[k] } })),
        );
      }
      const res = await submit({});
      setSubmitted(true);
      if (!res.emailSent) {
        toast.info("Profile saved. Advisor email delivery is pending setup.");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submitted) {
    return <Submitted email={user?.email ?? ""} onRetry={async () => {
      try {
        await retry({});
        setSubmitted(false);
        toast.success("You can now edit and resubmit.");
      } catch (e: any) {
        toast.error(e.message);
      }
    }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-semibold tracking-tight text-sm">
              Uppseekers <span className="text-muted-foreground font-normal">— Common Admission App</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{user?.email}</span>
            <button onClick={async () => { await signOut(); nav({ to: "/" }); }} className="inline-flex items-center gap-1 hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Application progress</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-semibold">{completion}<span className="text-base text-muted-foreground">%</span></p>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-primary transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            {SECTIONS.map((s, i) => {
              const isActive = active === s.key;
              const isFilled = Array.isArray(state[s.key])
                ? state[s.key].length > 0
                : Object.values(state[s.key]).some((x) => x && String(x).trim());
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-medium border ${
                    isFilled ? "bg-success text-success-foreground border-success" : "border-border text-muted-foreground"
                  }`}>
                    {isFilled ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{s.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{s.desc}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit to my advisor
          </button>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">Auto-saves as you type.</p>
        </aside>

        {/* Form */}
        <motion.main
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <SectionForm sectionKey={active} value={state[active]} onChange={(d) => updateSection(active, d)} />
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => {
                const idx = SECTIONS.findIndex((s) => s.key === active);
                if (idx > 0) setActive(SECTIONS[idx - 1].key);
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                const idx = SECTIONS.findIndex((s) => s.key === active);
                if (idx < SECTIONS.length - 1) setActive(SECTIONS[idx + 1].key);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-medium"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.main>
      </div>
    </div>
  );
}

function Submitted({ email, onRetry }: { email: string; onRetry: () => Promise<void> }) {
  const [retrying, setRetrying] = useState(false);
  const unlimited = email.toLowerCase().endsWith("@uppseekers.com");
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-50 blur-3xl" style={{ background: "radial-gradient(50% 50% at 50% 0%, oklch(0.7 0.2 265 / 0.35), transparent 70%)" }} />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl glass rounded-3xl p-10 shadow-elegant text-center"
      >
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
            <Loader2 className="h-6 w-6 text-primary-foreground" />
          </motion.div>
        </div>
        <h1 className="mt-6 font-display text-3xl tracking-tight">Our engine is working on your profile score.</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          The report will soon be shared with your Uppseekers advisor for a personalized summary and path discussion.
          You'll hear from us at the email you signed up with.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Want to update your answers? {unlimited ? "You have unlimited retries." : "You can retry once a week."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={async () => { setRetrying(true); await onRetry(); setRetrying(false); }}
            disabled={retrying}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />} Retry & improve
          </button>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Back to home</Link>
        </div>
      </motion.div>
    </div>
  );
}

/* --------------------------- Section forms --------------------------- */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
        {label}
        {hint && (
          <span className="relative inline-flex group">
            <Info className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 hidden group-hover:block w-64 rounded-lg bg-popover text-popover-foreground border border-border px-3 py-2 text-[11px] leading-relaxed shadow-elegant normal-case">
              {hint}
            </span>
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
const inputCls = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function SectionCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
      <h2 className="font-display text-3xl tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function SectionForm({ sectionKey, value, onChange }: { sectionKey: SectionKey; value: any; onChange: (v: any) => void }) {
  const upd = (k: string, v: string) => onChange({ ...value, [k]: v });

  if (sectionKey === "personal")
    return (
      <SectionCard title="Personal details" desc="Tell your advisor who they're working with.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name"><input className={inputCls} value={value.full_name ?? ""} onChange={(e) => upd("full_name", e.target.value)} /></Field>
          <Field label="Date of birth"><input type="date" className={inputCls} value={value.date_of_birth ?? ""} onChange={(e) => upd("date_of_birth", e.target.value)} /></Field>
          <Field label="Gender"><input className={inputCls} value={value.gender ?? ""} onChange={(e) => upd("gender", e.target.value)} /></Field>
          <Field label="Nationality"><input className={inputCls} value={value.nationality ?? ""} onChange={(e) => upd("nationality", e.target.value)} /></Field>
          <Field label="Phone"><input className={inputCls} value={value.phone ?? ""} onChange={(e) => upd("phone", e.target.value)} /></Field>
          <Field label="City"><input className={inputCls} value={value.city ?? ""} onChange={(e) => upd("city", e.target.value)} /></Field>
          <Field label="Country"><input className={inputCls} value={value.country ?? ""} onChange={(e) => upd("country", e.target.value)} /></Field>
          <Field label="Parent / Guardian name"><input className={inputCls} value={value.parent_name ?? ""} onChange={(e) => upd("parent_name", e.target.value)} /></Field>
          <Field label="Parent email"><input type="email" className={inputCls} value={value.parent_email ?? ""} onChange={(e) => upd("parent_email", e.target.value)} /></Field>
          <Field label="Parent phone"><input className={inputCls} value={value.parent_phone ?? ""} onChange={(e) => upd("parent_phone", e.target.value)} /></Field>
        </div>
      </SectionCard>
    );

  if (sectionKey === "academics")
    return (
      <SectionCard title="Academics" desc="Your school and grade record.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="School name"><input className={inputCls} value={value.school_name ?? ""} onChange={(e) => upd("school_name", e.target.value)} /></Field>
          <Field label="Curriculum (IB / AP / CBSE / A-Levels)"><input className={inputCls} value={value.curriculum ?? ""} onChange={(e) => upd("curriculum", e.target.value)} /></Field>
          <Field label="Current grade"><input className={inputCls} value={value.grade ?? ""} onChange={(e) => upd("grade", e.target.value)} /></Field>
          <Field label="Graduation year"><input className={inputCls} value={value.graduation_year ?? ""} onChange={(e) => upd("graduation_year", e.target.value)} /></Field>
          <Field label="GPA / Average"><input className={inputCls} value={value.gpa ?? ""} onChange={(e) => upd("gpa", e.target.value)} /></Field>
          <Field label="GPA scale (4.0 / 100 / 10)"><input className={inputCls} value={value.gpa_scale ?? ""} onChange={(e) => upd("gpa_scale", e.target.value)} /></Field>
          <Field label="Class rank"><input className={inputCls} value={value.class_rank ?? ""} onChange={(e) => upd("class_rank", e.target.value)} /></Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Honors / advanced courses"><textarea rows={3} className={inputCls} value={value.honors_courses ?? ""} onChange={(e) => upd("honors_courses", e.target.value)} /></Field>
          <Field label="Subjects you're strongest in"><textarea rows={3} className={inputCls} value={value.notable_subjects ?? ""} onChange={(e) => upd("notable_subjects", e.target.value)} /></Field>
        </div>
      </SectionCard>
    );

  if (sectionKey === "testing")
    return (
      <SectionCard title="Standardized testing" desc="Add what you have — leave the rest blank.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="SAT total"><input className={inputCls} value={value.sat_total ?? ""} onChange={(e) => upd("sat_total", e.target.value)} /></Field>
          <Field label="SAT Math"><input className={inputCls} value={value.sat_math ?? ""} onChange={(e) => upd("sat_math", e.target.value)} /></Field>
          <Field label="SAT EBRW"><input className={inputCls} value={value.sat_ebrw ?? ""} onChange={(e) => upd("sat_ebrw", e.target.value)} /></Field>
          <Field label="ACT"><input className={inputCls} value={value.act ?? ""} onChange={(e) => upd("act", e.target.value)} /></Field>
          <Field label="TOEFL"><input className={inputCls} value={value.toefl ?? ""} onChange={(e) => upd("toefl", e.target.value)} /></Field>
          <Field label="IELTS"><input className={inputCls} value={value.ielts ?? ""} onChange={(e) => upd("ielts", e.target.value)} /></Field>
          <Field label="Duolingo"><input className={inputCls} value={value.duolingo ?? ""} onChange={(e) => upd("duolingo", e.target.value)} /></Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="AP scores (e.g. Calc BC: 5, Bio: 4)"><textarea rows={2} className={inputCls} value={value.ap_scores ?? ""} onChange={(e) => upd("ap_scores", e.target.value)} /></Field>
          <Field label="Other tests / olympiads"><textarea rows={2} className={inputCls} value={value.other_tests ?? ""} onChange={(e) => upd("other_tests", e.target.value)} /></Field>
        </div>
      </SectionCard>
    );

  if (sectionKey === "activities") {
    const list: any[] = value ?? [];
    const updateItem = (i: number, k: string, v: string) => {
      const next = [...list];
      next[i] = { ...next[i], [k]: v };
      onChange(next);
    };
    return (
      <SectionCard title="Activities" desc="Clubs, sports, jobs, research, volunteering — add up to 10.">
        <div className="space-y-4">
          {list.map((a, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Activity {i + 1}</span>
                <button onClick={() => onChange(list.filter((_, j) => j !== i))} className="text-xs text-destructive inline-flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Activity name"><input className={inputCls} value={a.name ?? ""} onChange={(e) => updateItem(i, "name", e.target.value)} /></Field>
                <Field label="Your role"><input className={inputCls} value={a.role ?? ""} onChange={(e) => updateItem(i, "role", e.target.value)} /></Field>
                <Field label="Category"><input className={inputCls} value={a.category ?? ""} onChange={(e) => updateItem(i, "category", e.target.value)} /></Field>
                <Field label="Grades (e.g. 9,10,11)"><input className={inputCls} value={a.grades ?? ""} onChange={(e) => updateItem(i, "grades", e.target.value)} /></Field>
                <Field label="Hours / week"><input className={inputCls} value={a.hours_per_week ?? ""} onChange={(e) => updateItem(i, "hours_per_week", e.target.value)} /></Field>
                <Field label="Weeks / year"><input className={inputCls} value={a.weeks_per_year ?? ""} onChange={(e) => updateItem(i, "weeks_per_year", e.target.value)} /></Field>
              </div>
              <div className="mt-3">
                <Field label="Describe what you did and the impact"><textarea rows={3} className={inputCls} value={a.description ?? ""} onChange={(e) => updateItem(i, "description", e.target.value)} /></Field>
              </div>
            </div>
          ))}
          {list.length < 10 && (
            <button onClick={() => onChange([...list, { name: "" }])} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm hover:bg-muted">
              <Plus className="h-4 w-4" /> Add activity
            </button>
          )}
        </div>
      </SectionCard>
    );
  }

  if (sectionKey === "essays")
    return (
      <SectionCard title="Essays" desc="Drop your drafts — your advisor will review them.">
        <div className="space-y-4">
          <Field label="Common App / personal statement (650 words)"><textarea rows={8} className={inputCls} value={value.common_essay ?? ""} onChange={(e) => upd("common_essay", e.target.value)} /></Field>
          <Field label="Why this university / Why this major"><textarea rows={5} className={inputCls} value={value.why_us ?? ""} onChange={(e) => upd("why_us", e.target.value)} /></Field>
          <Field label="Anything else you want your advisor to know"><textarea rows={4} className={inputCls} value={value.additional_info ?? ""} onChange={(e) => upd("additional_info", e.target.value)} /></Field>
        </div>
      </SectionCard>
    );

  if (sectionKey === "recommendations") {
    const list: any[] = value ?? [];
    const updateItem = (i: number, k: string, v: string) => {
      const next = [...list];
      next[i] = { ...next[i], [k]: v };
      onChange(next);
    };
    return (
      <SectionCard title="Recommenders" desc="Teachers, counselors, or mentors who will write for you.">
        <div className="space-y-4">
          {list.map((r, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Recommender {i + 1}</span>
                <button onClick={() => onChange(list.filter((_, j) => j !== i))} className="text-xs text-destructive inline-flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Name"><input className={inputCls} value={r.recommender_name ?? ""} onChange={(e) => updateItem(i, "recommender_name", e.target.value)} /></Field>
                <Field label="Role / Subject"><input className={inputCls} value={r.recommender_role ?? ""} onChange={(e) => updateItem(i, "recommender_role", e.target.value)} /></Field>
                <Field label="Email"><input type="email" className={inputCls} value={r.recommender_email ?? ""} onChange={(e) => updateItem(i, "recommender_email", e.target.value)} /></Field>
                <Field label="Relationship to you"><input className={inputCls} value={r.relationship ?? ""} onChange={(e) => updateItem(i, "relationship", e.target.value)} /></Field>
              </div>
            </div>
          ))}
          {list.length < 5 && (
            <button onClick={() => onChange([...list, {}])} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm hover:bg-muted">
              <Plus className="h-4 w-4" /> Add recommender
            </button>
          )}
        </div>
      </SectionCard>
    );
  }

  // preferences
  return (
    <SectionCard title="Preferences" desc="Where you want to go and what you want to study.">
      <div className="space-y-4">
        <Field label="Intended major(s)"><input className={inputCls} value={value.intended_majors ?? ""} onChange={(e) => upd("intended_majors", e.target.value)} /></Field>
        <Field label="Preferred countries"><input className={inputCls} value={value.preferred_countries ?? ""} onChange={(e) => upd("preferred_countries", e.target.value)} /></Field>
        <Field label="Budget range (USD/year)"><input className={inputCls} value={value.budget_range ?? ""} onChange={(e) => upd("budget_range", e.target.value)} /></Field>
        <Field label="Universities you're already considering"><textarea rows={4} className={inputCls} value={value.university_list ?? ""} onChange={(e) => upd("university_list", e.target.value)} /></Field>
        <Field label="Notes for your advisor"><textarea rows={4} className={inputCls} value={value.notes ?? ""} onChange={(e) => upd("notes", e.target.value)} /></Field>
      </div>
    </SectionCard>
  );
}
