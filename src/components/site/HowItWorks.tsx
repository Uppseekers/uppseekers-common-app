import { motion } from "framer-motion";

const steps = [
  { n: "01", title: "Build your profile", desc: "Share academics, activities, tests, and writing in a guided flow." },
  { n: "02", title: "Get scored by AI", desc: "We benchmark you against accepted-student profiles globally." },
  { n: "03", title: "See your real chances", desc: "Safe, Target, and Dream universities — with match percentages." },
  { n: "04", title: "Improve & re-evaluate", desc: "Follow the priority roadmap. Watch your score climb." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div className="max-w-xl">
            <p className="text-sm text-primary font-medium">How it works</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
              From profile to acceptance,
              <span className="text-gradient italic"> in four steps.</span>
            </h2>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <span className="font-display text-5xl text-gradient">{s.n}</span>
              <h3 className="mt-5 font-medium">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
