import { Sparkles } from "lucide-react";

export function Footer() {
  const cols = [
    {
      title: "Product",
      links: ["Profile review", "University match", "Score engine", "Essay AI"],
    },
    {
      title: "Company",
      links: ["About", "Careers", "Press", "Contact"],
    },
    {
      title: "Resources",
      links: ["Blog", "Counselors", "Parents", "Help center"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Security", "DPA"],
    },
  ];
  return (
    <footer className="border-t border-border mt-32">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="font-semibold tracking-tight">
                Uppseekers <span className="text-muted-foreground font-normal">— Common Admission App</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              One profile, every dream school. Built by Uppseekers for ambitious undergrad applicants.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-medium">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Uppseekers. All rights reserved.</p>
          <p>akash@uppseekers.com</p>
        </div>
      </div>
    </footer>
  );
}
