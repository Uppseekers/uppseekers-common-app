import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FREE_DOMAIN = "@uppseekers.com";

/** Razorpay payment / payment-link / order reference, e.g. pay_XXXXXXXXXXXX */
const paymentRefSchema = z
  .string()
  .trim()
  .regex(/^(pay|plink|order)_[A-Za-z0-9]{6,}$/i, "Enter the payment ID from your Razorpay receipt (starts with pay_)");

export function isFreeEmail(email: string | null | undefined) {
  return !!email && email.toLowerCase().endsWith(FREE_DOMAIN);
}

/** Read-only: does the signed-in user have report access? */
export const getAccessStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string } | null)?.email ?? null;
    if (isFreeEmail(email)) return { hasAccess: true, source: "internal" as const };

    const { data } = await supabase
      .from("access_grants")
      .select("source")
      .eq("user_id", userId)
      .maybeSingle();

    return data
      ? { hasAccess: true, source: "paid" as const }
      : { hasAccess: false, source: null };
  });

/** Record a Razorpay payment reference against the signed-in user. */
export const claimAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ paymentRef: paymentRefSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const email = (claims as { email?: string } | null)?.email ?? null;
    if (isFreeEmail(email)) return { hasAccess: true as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Already granted for this user? Nothing to do.
    const { data: existing } = await supabaseAdmin
      .from("access_grants")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) return { hasAccess: true as const };

    const ref = data.paymentRef.trim();
    const { error } = await supabaseAdmin
      .from("access_grants")
      .insert({ user_id: userId, source: "razorpay", razorpay_payment_id: ref });

    if (error) {
      // Unique violation on razorpay_payment_id => reference already used.
      if (error.code === "23505" || error.code === "23514" || /duplicate|unique/i.test(error.message)) {
        throw new Error("That payment ID has already been used on another account.");
      }
      throw new Error(error.message);
    }
    return { hasAccess: true as const };
  });

/** Server-side guard used by report actions. */
export async function assertAccess(
  supabase: { from: (t: "access_grants") => any },
  userId: string,
  email: string | null | undefined,
) {
  if (isFreeEmail(email)) return;
  const { data } = await supabase
    .from("access_grants")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("Payment required to generate your readiness report.");
}
