import { motion } from "framer-motion";
import { Brain, Target, FileText, GraduationCap, TrendingUp, Shield } from "lucide-react";

const features = [
  { icon: Brain, title: "AI profile scoring", desc: "Weighted analysis across academics, activities, essays & leadership." },
  { icon: Target, title: "Safe · Target · Dream", desc: "Categorized university list calibrated to your real chances." },
  { icon: FileText, title: "Essay intelligence", desc: "Authenticity, narrative depth, and storytelling signals." },
  { icon: GraduationCap, title: "200+ universities", desc: "Global dataset across US, UK, Canada, Singapore, Germany." },
  { icon: TrendingUp, title: "Improvement plan", desc: "Priority-ranked actions with estimated impact on your score." },
  { icon: Shield, title: "Private by default", desc: "Your data never trains a public model. Yours, always." },
];

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm text-primary font-medium">Features</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
            Built like a private admissions office —
            <span className="text-gradient italic"> for everyone.</span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border border-border bg-card p-6 hover:shadow-card transition"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground group-hover:bg-gradient-primary group-hover:text-primary-foreground transition">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-medium">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
