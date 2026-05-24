import { motion } from "framer-motion";

const unis = [
  { name: "Stanford", country: "USA", match: 32, tag: "Dream" },
  { name: "MIT", country: "USA", match: 28, tag: "Dream" },
  { name: "UIUC", country: "USA", match: 64, tag: "Target" },
  { name: "Purdue", country: "USA", match: 71, tag: "Target" },
  { name: "U of Toronto", country: "Canada", match: 78, tag: "Target" },
  { name: "NTU Singapore", country: "Singapore", match: 58, tag: "Target" },
  { name: "TU Munich", country: "Germany", match: 81, tag: "Safe" },
  { name: "ASU", country: "USA", match: 91, tag: "Safe" },
];

const toneFor = (tag: string) =>
  tag === "Dream"
    ? "text-destructive border-destructive/30 bg-destructive/10"
    : tag === "Target"
      ? "text-warning border-warning/30 bg-warning/10"
      : "text-success border-success/30 bg-success/10";

export function Universities() {
  return (
    <section id="universities" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm text-primary font-medium">University intelligence</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
            A calibrated list. Not a wishlist.
          </h2>
          <p className="mt-4 text-muted-foreground">
            We benchmark your profile against admission data across 200+ universities — globally.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {unis.map((u, i) => (
            <motion.div
              key={u.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group rounded-2xl border border-border bg-card p-5 hover:-translate-y-0.5 hover:shadow-card transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{u.country}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full border ${toneFor(u.tag)}`}>{u.tag}</span>
              </div>
              <div className="mt-5">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-semibold tracking-tight">{u.match}<span className="text-base text-muted-foreground">%</span></span>
                  <span className="text-xs text-muted-foreground">match</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${u.match}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="h-full bg-gradient-primary"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
