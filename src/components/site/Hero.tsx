import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroGlow from "@/assets/hero-glow.jpg";

export function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      {/* Background mesh */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, oklch(0.72 0.18 265 / 0.4), transparent 70%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 grid-bg opacity-[0.15]" />

      <div className="mx-auto max-w-6xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs text-muted-foreground"
        >
          <Star className="h-3.5 w-3.5 text-primary" fill="currentColor" />
          Trusted admissions intelligence — now in private beta
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mt-7 font-display text-5xl sm:text-7xl md:text-[88px] leading-[0.95] tracking-tight"
        >
          Know where you stand
          <br />
          <span className="text-gradient italic">before you apply.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-7 mx-auto max-w-xl text-base sm:text-lg text-muted-foreground"
        >
          AdmitIQ AI evaluates your academics, activities, and essays —
          then tells you which top universities you can actually get into.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium shadow-elegant hover:opacity-90 transition"
          >
            Start free profile review
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <Sparkles className="h-4 w-4" />
            See how it works
          </a>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-20 mx-auto max-w-5xl"
        >
          <div className="relative rounded-3xl border border-border overflow-hidden shadow-elegant">
            <img
              src={heroGlow}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              width={1920}
              height={1280}
            />
            <div className="relative bg-card/70 backdrop-blur-xl p-8 grid grid-cols-1 md:grid-cols-3 gap-5">
              <ScoreCard label="Academic" value={92} accent="primary" />
              <ScoreCard label="Activities" value={87} accent="success" />
              <ScoreCard label="Admit Readiness" value={89} accent="warning" />

              <div className="md:col-span-3 grid grid-cols-3 gap-3 mt-3">
                <UniPill name="Stanford" tag="Dream" tone="destructive" pct={32} />
                <UniPill name="UIUC" tag="Target" tone="warning" pct={64} />
                <UniPill name="ASU" tag="Safe" tone="success" pct={91} />
              </div>
            </div>
          </div>

          {/* Floating chips */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:flex absolute -left-6 top-12 glass rounded-2xl px-4 py-3 shadow-card items-center gap-2 text-xs"
          >
            <span className="h-2 w-2 rounded-full bg-success" />
            +120 SAT projected
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:flex absolute -right-6 bottom-12 glass rounded-2xl px-4 py-3 shadow-card items-center gap-2 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            3 essays need work
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ScoreCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "primary" | "success" | "warning";
}) {
  const colorMap = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-5 text-left">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight">{value}</p>
      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`h-full ${colorMap[accent]}`}
        />
      </div>
    </div>
  );
}

function UniPill({
  name,
  tag,
  tone,
  pct,
}: {
  name: string;
  tag: string;
  tone: "success" | "warning" | "destructive";
  pct: number;
}) {
  const toneMap = {
    success: "text-success border-success/30 bg-success/10",
    warning: "text-warning border-warning/30 bg-warning/10",
    destructive: "text-destructive border-destructive/30 bg-destructive/10",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-background/70 p-3 text-left flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-[10px] text-muted-foreground">{pct}% match</p>
      </div>
      <span className={`text-[10px] px-2 py-1 rounded-full border ${toneMap[tone]}`}>{tag}</span>
    </div>
  );
}
