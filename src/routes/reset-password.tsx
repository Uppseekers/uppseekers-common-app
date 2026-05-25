import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — Uppseekers" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase redirects with a recovery session in the URL hash; the client picks it up automatically.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated. You're signed in.");
      await nav({ to: "/onboarding" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-50 blur-3xl" style={{ background: "radial-gradient(50% 50% at 50% 0%, oklch(0.7 0.2 265 / 0.3), transparent 70%)" }} />
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-elegant">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-semibold">Uppseekers</span>
        </div>
        <h1 className="mt-6 font-display text-3xl tracking-tight">Set a new password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Choose a strong password (6+ characters).</p>

        {!ready ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Open the reset link from your email to continue. <Link to="/forgot-password" className="underline">Request a new link</Link>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-3">
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
