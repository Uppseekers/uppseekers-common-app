import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [{ title: "Sign in — AdmitIQ AI" }],
  }),
  component: SignIn,
});

function SignIn() {
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
        <h1 className="mt-6 font-display text-3xl tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue your application journey.</p>

        <form className="mt-7 space-y-3">
          <input type="email" placeholder="Email" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input type="password" placeholder="Password" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button type="button" className="w-full rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition">
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="text-foreground hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
