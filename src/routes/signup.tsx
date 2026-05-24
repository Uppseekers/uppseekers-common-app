import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Uppseekers" }] }),
  component: SignUp,
});

function SignUp() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/onboarding",
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your inbox to verify.");
    nav({ to: "/onboarding" });
  };

  const handleGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/onboarding" });
    if (res.error) toast.error(res.error.message);
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
        <h1 className="mt-6 font-display text-3xl tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Build one applicant profile. Share it with your Uppseekers advisor.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-3">
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (6+ chars)" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <button onClick={handleGoogle} className="w-full rounded-xl border border-border bg-card py-2.5 text-sm font-medium hover:bg-accent transition">
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account? <Link to="/signin" className="text-foreground hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
