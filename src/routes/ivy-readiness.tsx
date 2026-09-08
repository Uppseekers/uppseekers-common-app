import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, GraduationCap, Loader2, Lock, ShieldCheck, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { claimAccess } from "@/lib/access.functions";

export const Route = createFileRoute("/ivy-readiness")({
  head: () => ({
    meta: [
      { title: "Ivy League Readiness Report — ₹99 | Uppseekers" },
      {
        name: "description",
        content:
          "Don't apply blind. For ₹99, get an ex-admission-reviewer readiness report showing your Ivy League gaps, category-wise scores and a shortlist of Safe, Target and Dream universities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Ivy League Readiness Report — ₹99 | Uppseekers" },
      {
        property: "og:description",
        content: "Know your gaps before you apply. Readiness report reviewed by ex-admission officers for ₹99.",
      },
      { name: "twitter:description", content: "Know your gaps before you apply. Readiness report for ₹99." },
    ],
  }),
  component: IvyLanding,
});

const FREE_DOMAIN = "@uppseekers.com";

function RazorpayButton() {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form || form.dataset.loaded === "true") return;
    form.dataset.loaded = "true";
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.async = true;
    script.dataset.payment_button_id = "pl_TZTkAamKIRyrAs";
    form.appendChild(script);
  }, []);

  return <form ref={formRef} className="flex justify-center" />;
}

const INCLUDES = [
  { icon: Target, title: "Category-wise score", desc: "Academics, super-curriculars, extracurriculars, essays, projects, leadership." },
  { icon: Sparkles, title: "Gap analysis", desc: "Exactly where your profile falls short of Ivy-level admits — and what to fix first." },
  { icon: BadgeCheck, title: "Safe / Target / Dream list", desc: "Your admission chance % across 77 top universities, weighted the way they read files." },
  { icon: ShieldCheck, title: "Ex-reviewer read", desc: "Your profile is reviewed by ex-admission reviewers, not a template." },
];

function IvyLanding() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [loading, setLoading] = useState(false);

  const isFree = email.trim().toLowerCase().endsWith(FREE_DOMAIN);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // One flow: create the account (or sign in if it already exists), then unlock.
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      let session = signUpData?.session ?? null;

      if (signUpError) {
        if (/already|registered|exists/i.test(signUpError.message)) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            toast.error("An account already exists for this email and the password doesn't match. Use “Forgot password”.");
            return;
          }
          session = signInData.session;
        } else {
          toast.error(signUpError.message);
          return;
        }
      }

      if (!session) {
        toast.error("Check your inbox to confirm your email, then sign in to continue.");
        return;
      }

      if (!isFree) {
        await claimAccess({ data: { paymentRef: paymentRef.trim() } });
      }

      toast.success(isFree ? "You're in — Uppseekers team access." : "Payment verified. Your report is unlocked.");
      await nav({ to: "/onboarding" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-60 blur-3xl"
        style={{ background: "radial-gradient(50% 50% at 50% 0%, oklch(0.7 0.2 265 / 0.35), transparent 70%)" }}
      />

      <header className="mx-auto max-w-6xl px-6 pt-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-semibold tracking-tight">Uppseekers</span>
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Limited launch price — ₹99
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Get an Ivy League readiness report for{" "}
              <span className="italic text-primary">₹99</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Most students apply without knowing their gaps — and find out only through a rejection.
              Answer 47 questions, and ex-admission reviewers tell you exactly where you stand and what
              to fix while there's still time.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {INCLUDES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-border bg-card/60 p-4">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="mt-2.5 text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-3xl p-7 shadow-elegant lg:sticky lg:top-10"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl tracking-tight">₹99</span>
              <span className="text-sm text-muted-foreground">one-time · full report</span>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Step 1 — Pay ₹99</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Pay securely via Razorpay. Keep the payment ID from your receipt — you'll paste it below.
              </p>
              <div className="mt-4">
                <RazorpayButton />
              </div>
            </div>

            <form onSubmit={handleUnlock} className="mt-4 rounded-2xl border border-border bg-background/60 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Step 2 — Unlock your report
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Same email you paid with. This creates your account and unlocks the report in one step.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  required
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (6+ chars)"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                {isFree ? (
                  <p className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Uppseekers team email — no payment needed.
                  </p>
                ) : (
                  <input
                    required
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="Razorpay payment ID (pay_XXXXXXXXXXXX)"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
                <button
                  disabled={loading}
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {isFree ? "Get free access" : "Unlock my report"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                Each payment ID unlocks one account. Your details are shared only with Uppseekers reviewers.
              </p>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
