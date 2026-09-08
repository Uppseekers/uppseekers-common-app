import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Uppseekers" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent(true);
      toast.success("Check your inbox for the reset link.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-50 blur-3xl" style={{ background: "radial-gradient(50% 50% at 50% 0%, oklch(0.7 0.2 265 / 0.3), transparent 70%)" }} />
      <div className="absolute top-6 left-6">
        <Link to="/signin" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>

      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-elegant">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-semibold">Uppseekers</span>
        </div>
        <h1 className="mt-6 font-display text-3xl tracking-tight">Reset your password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We'll email you a link from noreply@uppseekers.com to set a new password.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm">
            If <b>{email}</b> exists, a reset link is on its way. Check your spam folder if you don't see it.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-3">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
