import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-32">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-semibold tracking-tight">
              Uppseekers <span className="text-muted-foreground font-normal">— Common Admission App</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            One profile, every dream school. Built by Uppseekers for ambitious undergrad applicants.
          </p>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Uppseekers. All rights reserved.</p>
          <p>akash@uppseekers.com</p>
        </div>
      </div>
    </footer>
  );
}
