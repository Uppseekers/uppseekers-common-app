import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-primary p-12 sm:p-16 text-center shadow-elegant"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at top right, oklch(1 0 0 / 0.4), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-4xl sm:text-6xl tracking-tight text-primary-foreground">
              Your dream college. <span className="italic opacity-80">Decoded.</span>
            </h2>
            <p className="mt-5 mx-auto max-w-xl text-primary-foreground/80">
              Get a free admissions readiness score in under 10 minutes.
              No credit card. No counselor required.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-background text-foreground px-6 py-3 text-sm font-medium shadow-card hover:opacity-90 transition"
            >
              Calculate my chances
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
