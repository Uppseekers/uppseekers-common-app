import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { CheckCircle2, Check, ChevronRight, GraduationCap, Info, Loader2, LogOut, Mail, Plus, RotateCw, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getMyProfile, saveSection, submitProfile, startRetry, emailReportToAdvisor } from "@/lib/onboarding.functions";
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
type Errors = Record<string, string>;

/** Validate one section. Returns { ok, errors } where errors keys map to field names. */
function validateSection(key: SectionKey, value: any): { ok: boolean; errors: Errors } {
  const errors: Errors = {};
  const req = (k: string, label: string) => {
    const v = value?.[k];
    if (!v || !String(v).trim()) errors[k] = `${label} is required`;
  };
  if (key === "personal") {
    req("full_name", "Full name");
    req("phone", "Phone");
    req("parent_name", "Parent / Guardian name");
    if (!value?.parent_phone || String(value.parent_phone).trim().length < 5)
      errors.parent_phone = "Parent's phone is required";
    if (value?.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value.parent_email)))
      errors.parent_email = "Enter a valid email";
  } else if (key === "academics") {
    req("school_name", "School name");
    req("curriculum", "Curriculum");
    req("grade", "Grade");
    req("graduation_year", "Graduation year");
    req("gpa", "GPA");
    req("gpa_scale", "GPA scale");
  } else if (key === "activities") {
    const list: any[] = Array.isArray(value) ? value : [];
    if (list.length === 0) errors._list = "Add at least one activity";
    list.forEach((a, i) => {
      if (!a?.name || !String(a.name).trim()) errors[`name_${i}`] = "Activity name is required";
    });
  } else if (key === "essays") {
    if (!value?.common_essay || String(value.common_essay).trim().length < 100)
      errors.common_essay = "Personal statement should be at least 100 characters";
    if (!value?.why_us || String(value.why_us).trim().length < 50)
      errors.why_us = "Tell us why this university / major (50+ characters)";
  } else if (key === "recommendations") {
    const list: any[] = Array.isArray(value) ? value : [];
    if (list.length === 0) errors._list = "Add at least one recommender";
    list.forEach((r, i) => {
      if (!r?.recommender_name) errors[`recommender_name_${i}`] = "Name is required";
      if (!r?.recommender_email) errors[`recommender_email_${i}`] = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(r.recommender_email)))
        errors[`recommender_email_${i}`] = "Enter a valid email";
    });
  } else if (key === "preferences") {
    req("intended_majors", "Intended major");
    req("preferred_countries", "Preferred countries");
    req("university_list", "University list");
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

function Onboarding() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const save = useServerFn(saveSection);
  const submit = useServerFn(submitProfile);
  const retry = useServerFn(startRetry);
  const sendReport = useServerFn(emailReportToAdvisor);

  const [active, setActive] = useState<SectionKey>("personal");
  const [state, setState] = useState<State | null>(null);
  const [errors, setErrors] = useState<Errors>({});
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
    setErrors({}); // clear errors as user types
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save({ data: { section: key, data } }).catch(() => {/* validation errors silently — surfaced on continue */});
    }, 700);
  };

  const goNext = () => {
    if (!state) return;
    const result = validateSection(active, state[active]);
    if (!result.ok) {
      setErrors(result.errors);
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    setErrors({});
    const idx = SECTIONS.findIndex((s) => s.key === active);
    if (idx < SECTIONS.length - 1) setActive(SECTIONS[idx + 1].key);
  };

  const handleSubmit = async () => {
    if (!state) return;
    // Validate every section before submitting
    for (const s of SECTIONS) {
      const r = validateSection(s.key, state[s.key]);
      if (!r.ok) {
        setActive(s.key);
        setErrors(r.errors);
        toast.error(`Please complete the ${s.label} section first.`);
        return;
      }
    }
    setSubmitting(true);
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      await Promise.all(SECTION_KEYS.map((k) => save({ data: { section: k, data: state[k] } })));
      const res = await submit({});
      setSubmitted(true);
      if (!res.emailSent) toast.info("Profile saved. Advisor email delivery is pending setup.");
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
    return <Submitted
      email={user?.email ?? ""}
      onRetry={async () => {
        try {
          await retry({});
          setSubmitted(false);
          toast.success("You can now edit and resubmit.");
        } catch (e: any) {
          toast.error(e.message);
        }
      }}
      onSendReport={async (advisorEmail: string) => {
        const res = await sendReport({ data: { advisorEmail } });
        return res;
      }}
    />;
  }

  const activeIdx = SECTIONS.findIndex((s) => s.key === active);
  const isLast = activeIdx === SECTIONS.length - 1;

  return (
    <div className="min-h-screen bg-background">
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
          <p className="mt-4 text-[11px] text-muted-foreground text-center">Auto-saves as you type.</p>
        </aside>

        <motion.main key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <SectionForm sectionKey={active} value={state[active]} errors={errors} onChange={(d) => updateSection(active, d)} />

          {errors._list && (
            <p className="mt-3 text-sm text-destructive">{errors._list}</p>
          )}

          <div className="mt-6 flex justify-between items-center gap-4">
            <button
              onClick={() => {
                const idx = SECTIONS.findIndex((s) => s.key === active);
                if (idx > 0) { setErrors({}); setActive(SECTIONS[idx - 1].key); }
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-glow hover:opacity-95 transition disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit to Ex-Admission Reviewers
              </button>
            ) : (
              <button
                onClick={goNext}
                className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-medium"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.main>
      </div>
    </div>
  );
}

function downloadBase64Pdf(b64: string, filename: string) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  const blob = new Blob([arr], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
}

function Submitted({ email, onRetry, onDownload }: { email: string; onRetry: () => Promise<void>; onDownload: () => Promise<void> }) {
  const [retrying, setRetrying] = useState(false);
  const [downloading, setDownloading] = useState(false);
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
          <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mt-6 font-display text-4xl tracking-tight">Successfully submitted.</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Your profile has been shared with our ex-admission reviewers. You'll receive a personalized path discussion at <span className="text-foreground font-medium">{email}</span>.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={async () => { setDownloading(true); await onDownload(); setDownloading(false); }}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-glow hover:opacity-95 transition disabled:opacity-60"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download PDF report
          </button>

          {unlimited ? (
            <button
              onClick={async () => { setRetrying(true); await onRetry(); setRetrying(false); }}
              disabled={retrying}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition disabled:opacity-60"
            >
              {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />} Retry
            </button>
          ) : (
            <div className="text-xs text-muted-foreground px-3 py-2 rounded-full bg-muted">
              You can retry after 90 days.
            </div>
          )}
        </div>
        <div className="mt-5">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Back to home</Link>
        </div>
      </motion.div>
    </div>
  );
}

/* --------------------------- Section forms --------------------------- */

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
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
      {error && <span className="block mt-1 text-[11px] text-destructive">{error}</span>}
    </label>
  );
}
const baseInput = "w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
const cls = (err?: string) => `${baseInput} ${err ? "border-destructive focus:ring-destructive" : "border-border"}`;

function SectionCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
      <h2 className="font-display text-3xl tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function SectionForm({ sectionKey, value, errors, onChange }: { sectionKey: SectionKey; value: any; errors: Errors; onChange: (v: any) => void }) {
  const upd = (k: string, v: string) => onChange({ ...value, [k]: v });
  const e = (k: string) => errors[k];

  if (sectionKey === "personal")
    return (
      <SectionCard title="Personal details" desc="Tell your advisor who they're working with.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name *" hint="As it appears on your passport / school records." error={e("full_name")}><input className={cls(e("full_name"))} value={value.full_name ?? ""} onChange={(ev) => upd("full_name", ev.target.value)} /></Field>
          <Field label="Date of birth" hint="Used by universities to verify age eligibility."><input type="date" className={cls()} value={value.date_of_birth ?? ""} onChange={(ev) => upd("date_of_birth", ev.target.value)} /></Field>
          <Field label="Gender" hint="Optional. Used only for demographic reporting."><input className={cls()} value={value.gender ?? ""} onChange={(ev) => upd("gender", ev.target.value)} /></Field>
          <Field label="Nationality" hint="Country of citizenship — affects visa & fee category."><input className={cls()} value={value.nationality ?? ""} onChange={(ev) => upd("nationality", ev.target.value)} /></Field>
          <Field label="Phone *" hint="Include country code, e.g. +91 98xxxxxx." error={e("phone")}><input className={cls(e("phone"))} value={value.phone ?? ""} onChange={(ev) => upd("phone", ev.target.value)} /></Field>
          <Field label="City" hint="City where you currently live."><input className={cls()} value={value.city ?? ""} onChange={(ev) => upd("city", ev.target.value)} /></Field>
          <Field label="Country" hint="Country where you currently live."><input className={cls()} value={value.country ?? ""} onChange={(ev) => upd("country", ev.target.value)} /></Field>
          <Field label="Parent / Guardian name *" hint="Primary contact parent or guardian." error={e("parent_name")}><input className={cls(e("parent_name"))} value={value.parent_name ?? ""} onChange={(ev) => upd("parent_name", ev.target.value)} /></Field>
          <Field label="Parent email" hint="Universities sometimes copy parents on correspondence." error={e("parent_email")}><input type="email" className={cls(e("parent_email"))} value={value.parent_email ?? ""} onChange={(ev) => upd("parent_email", ev.target.value)} /></Field>
          <Field label="Parent's phone *" hint="Mandatory. Include country code, e.g. +91 98xxxxxx." error={e("parent_phone")}><input className={cls(e("parent_phone"))} value={value.parent_phone ?? ""} onChange={(ev) => upd("parent_phone", ev.target.value)} /></Field>
        </div>
      </SectionCard>
    );

  if (sectionKey === "academics")
    return (
      <SectionCard title="Academics" desc="Your school and grade record.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="School name *" hint="Full official name of your current/most recent school." error={e("school_name")}><input className={cls(e("school_name"))} value={value.school_name ?? ""} onChange={(ev) => upd("school_name", ev.target.value)} /></Field>
          <Field label="Curriculum *" hint="Your board — IB, AP, CBSE, ICSE, A-Levels, etc." error={e("curriculum")}><input className={cls(e("curriculum"))} value={value.curriculum ?? ""} onChange={(ev) => upd("curriculum", ev.target.value)} /></Field>
          <Field label="Current grade *" hint="E.g. Grade 11, Year 12." error={e("grade")}><input className={cls(e("grade"))} value={value.grade ?? ""} onChange={(ev) => upd("grade", ev.target.value)} /></Field>
          <Field label="Graduation year *" hint="Year you will finish high school." error={e("graduation_year")}><input className={cls(e("graduation_year"))} value={value.graduation_year ?? ""} onChange={(ev) => upd("graduation_year", ev.target.value)} /></Field>
          <Field label="GPA / Average *" hint="Your cumulative grade average." error={e("gpa")}><input className={cls(e("gpa"))} value={value.gpa ?? ""} onChange={(ev) => upd("gpa", ev.target.value)} /></Field>
          <Field label="GPA scale *" hint="The maximum on your school's grading scale (4.0 / 100 / 10)." error={e("gpa_scale")}><input className={cls(e("gpa_scale"))} value={value.gpa_scale ?? ""} onChange={(ev) => upd("gpa_scale", ev.target.value)} /></Field>
          <Field label="Class rank" hint="E.g. 5/120 — leave blank if your school doesn't rank."><input className={cls()} value={value.class_rank ?? ""} onChange={(ev) => upd("class_rank", ev.target.value)} /></Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Honors / advanced courses" hint="List honors, AP, IB HL, or advanced electives you've taken."><textarea rows={3} className={cls()} value={value.honors_courses ?? ""} onChange={(ev) => upd("honors_courses", ev.target.value)} /></Field>
          <Field label="Subjects you're strongest in" hint="Subjects where you consistently score highest or enjoy most."><textarea rows={3} className={cls()} value={value.notable_subjects ?? ""} onChange={(ev) => upd("notable_subjects", ev.target.value)} /></Field>
        </div>
      </SectionCard>
    );

  if (sectionKey === "testing")
    return (
      <SectionCard title="Standardized testing" desc="Add what you have — leave the rest blank.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="SAT total" hint="Highest total SAT score (out of 1600)."><input className={cls()} value={value.sat_total ?? ""} onChange={(ev) => upd("sat_total", ev.target.value)} /></Field>
          <Field label="SAT Math" hint="SAT Math section score (out of 800)."><input className={cls()} value={value.sat_math ?? ""} onChange={(ev) => upd("sat_math", ev.target.value)} /></Field>
          <Field label="SAT EBRW" hint="SAT EBRW score (out of 800)."><input className={cls()} value={value.sat_ebrw ?? ""} onChange={(ev) => upd("sat_ebrw", ev.target.value)} /></Field>
          <Field label="ACT" hint="Composite ACT score (out of 36)."><input className={cls()} value={value.act ?? ""} onChange={(ev) => upd("act", ev.target.value)} /></Field>
          <Field label="TOEFL" hint="TOEFL iBT total score (out of 120)."><input className={cls()} value={value.toefl ?? ""} onChange={(ev) => upd("toefl", ev.target.value)} /></Field>
          <Field label="IELTS" hint="IELTS overall band (out of 9)."><input className={cls()} value={value.ielts ?? ""} onChange={(ev) => upd("ielts", ev.target.value)} /></Field>
          <Field label="Duolingo" hint="Duolingo English Test score (out of 160)."><input className={cls()} value={value.duolingo ?? ""} onChange={(ev) => upd("duolingo", ev.target.value)} /></Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="AP scores" hint="List each AP subject with its score, one per line if possible."><textarea rows={2} className={cls()} value={value.ap_scores ?? ""} onChange={(ev) => upd("ap_scores", ev.target.value)} /></Field>
          <Field label="Other tests / olympiads" hint="Olympiads, SAT subject tests, national exams, etc."><textarea rows={2} className={cls()} value={value.other_tests ?? ""} onChange={(ev) => upd("other_tests", ev.target.value)} /></Field>
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
                <Field label="Activity name *" hint="Name of the club, sport, job, project, or program." error={e(`name_${i}`)}><input className={cls(e(`name_${i}`))} value={a.name ?? ""} onChange={(ev) => updateItem(i, "name", ev.target.value)} /></Field>
                <Field label="Your role" hint="E.g. President, Member, Captain, Intern, Founder."><input className={cls()} value={a.role ?? ""} onChange={(ev) => updateItem(i, "role", ev.target.value)} /></Field>
                <Field label="Category" hint="Super-curricular, Co-curricular, Extra-curricular, Volunteering, Academic."><input className={cls()} value={a.category ?? ""} onChange={(ev) => updateItem(i, "category", ev.target.value)} /></Field>
                <Field label="Grades (e.g. 9,10,11)" hint="Which school years you participated."><input className={cls()} value={a.grades ?? ""} onChange={(ev) => updateItem(i, "grades", ev.target.value)} /></Field>
                <Field label="Hours / week" hint="Average hours per week."><input className={cls()} value={a.hours_per_week ?? ""} onChange={(ev) => updateItem(i, "hours_per_week", ev.target.value)} /></Field>
                <Field label="Weeks / year" hint="Number of weeks per year."><input className={cls()} value={a.weeks_per_year ?? ""} onChange={(ev) => updateItem(i, "weeks_per_year", ev.target.value)} /></Field>
              </div>
              <div className="mt-3">
                <Field label="Describe what you did and the impact" hint="Focus on outcomes, leadership, recognitions, and measurable impact."><textarea rows={3} className={cls()} value={a.description ?? ""} onChange={(ev) => updateItem(i, "description", ev.target.value)} /></Field>
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
          <Field label="Common App / personal statement *" hint="A personal essay that shows who you are beyond grades — story, voice, growth (100+ chars)." error={e("common_essay")}><textarea rows={8} className={cls(e("common_essay"))} value={value.common_essay ?? ""} onChange={(ev) => upd("common_essay", ev.target.value)} /></Field>
          <Field label="Why this university / Why this major *" hint="Be specific: programs, faculty, opportunities — avoid generic statements." error={e("why_us")}><textarea rows={5} className={cls(e("why_us"))} value={value.why_us ?? ""} onChange={(ev) => upd("why_us", ev.target.value)} /></Field>
          <Field label="Anything else you want your advisor to know" hint="Context that doesn't fit elsewhere — challenges, gaps, plans."><textarea rows={4} className={cls()} value={value.additional_info ?? ""} onChange={(ev) => upd("additional_info", ev.target.value)} /></Field>
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
                <Field label="Name *" hint="Full name of your recommender." error={e(`recommender_name_${i}`)}><input className={cls(e(`recommender_name_${i}`))} value={r.recommender_name ?? ""} onChange={(ev) => updateItem(i, "recommender_name", ev.target.value)} /></Field>
                <Field label="Role / Subject" hint="E.g. Math Teacher, School Counselor, Research Mentor."><input className={cls()} value={r.recommender_role ?? ""} onChange={(ev) => updateItem(i, "recommender_role", ev.target.value)} /></Field>
                <Field label="Email *" hint="Official school or work email is strongly preferred." error={e(`recommender_email_${i}`)}><input type="email" className={cls(e(`recommender_email_${i}`))} value={r.recommender_email ?? ""} onChange={(ev) => updateItem(i, "recommender_email", ev.target.value)} /></Field>
                <Field label="Relationship to you" hint="How long they've known you and in what capacity."><input className={cls()} value={r.relationship ?? ""} onChange={(ev) => updateItem(i, "relationship", ev.target.value)} /></Field>
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
        <Field label="Intended major(s) *" hint="Top 1-3 fields you want to study." error={e("intended_majors")}><input className={cls(e("intended_majors"))} value={value.intended_majors ?? ""} onChange={(ev) => upd("intended_majors", ev.target.value)} /></Field>
        <Field label="Preferred countries *" hint="E.g. USA, UK, Canada, Singapore, Netherlands. Used to prioritize your university shortlist." error={e("preferred_countries")}><input className={cls(e("preferred_countries"))} value={value.preferred_countries ?? ""} onChange={(ev) => upd("preferred_countries", ev.target.value)} /></Field>
        <Field label="Budget range (USD/year)" hint="Total annual budget for tuition + living."><input className={cls()} value={value.budget_range ?? ""} onChange={(ev) => upd("budget_range", ev.target.value)} /></Field>
        <Field label="Universities you're already considering *" hint="Comma-separated list — we'll heavily prioritize these in your shortlist." error={e("university_list")}><textarea rows={4} className={cls(e("university_list"))} value={value.university_list ?? ""} onChange={(ev) => upd("university_list", ev.target.value)} /></Field>
        <Field label="Notes for your advisor" hint="Anything else your advisor should know — preferences, constraints, deadlines."><textarea rows={4} className={cls()} value={value.notes ?? ""} onChange={(ev) => upd("notes", ev.target.value)} /></Field>
      </div>
    </SectionCard>
  );
}
