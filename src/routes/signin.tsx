import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign in — Uppseekers" }] }),
  component: SignIn,
});

function SignIn() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Welcome back");
      await nav({ to: "/onboarding" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-50 blur-3xl" style={{ background: "radial-gradient(50% 50% at 50% 0%, oklch(0.7 0.2 265 / 0.3), transparent 70%)" }} />
      <div className="absolute top-6 left-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-elegant">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-semibold">Uppseekers <span className="text-muted-foreground font-normal text-sm">CAA</span></span>
        </div>
        <h1 className="mt-6 font-display text-3xl tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue your application.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-3">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </button>
        </form>

        <div className="mt-4 flex justify-between text-xs">
          <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">Forgot password?</Link>
          <Link to="/signup" className="text-muted-foreground hover:text-foreground">Create account</Link>
        </div>
      </div>
    </div>
  );
}
