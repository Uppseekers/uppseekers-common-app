import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — AdmitIQ AI" },
      { name: "description", content: "Create your AdmitIQ AI profile and get scored." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-50 blur-3xl"
        style={{ background: "radial-gradient(50% 50% at 50% 0%, oklch(0.7 0.2 265 / 0.3), transparent 70%)" }}
      />
      <div className="absolute top-6 left-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-elegant">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-semibold">AdmitIQ <span className="text-gradient">AI</span></span>
        </div>
        <h1 className="mt-6 font-display text-3xl tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Start your free profile review in under 10 minutes.</p>

        <form className="mt-7 space-y-3">
          <input type="email" placeholder="Email" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input type="password" placeholder="Password" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button type="button" className="w-full rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition">
            Create account
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <button className="w-full rounded-xl border border-border bg-card py-2.5 text-sm font-medium hover:bg-accent transition">
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="text-foreground hover:underline">Sign in</Link>
        </p>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Auth wiring coming next — enable Lovable Cloud to power real accounts.
        </p>
      </div>
    </div>
  );
}
