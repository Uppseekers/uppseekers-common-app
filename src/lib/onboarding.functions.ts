import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  personalSchema,
  academicsSchema,
  testingSchema,
  activitiesSchema,
  essaysSchema,
  recommendationsSchema,
  preferencesSchema,
} from "./onboarding-schema";

const ADVISOR_EMAIL = "akash@uppseekers.com";

const sectionSchemas = {
  personal: personalSchema,
  academics: academicsSchema,
  testing: testingSchema,
  activities: activitiesSchema,
  essays: essaysSchema,
  recommendations: recommendationsSchema,
  preferences: preferencesSchema,
} as const;

const sectionKey = z.enum([
  "personal",
  "academics",
  "testing",
  "activities",
  "essays",
  "recommendations",
  "preferences",
]);

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("applicant_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      await supabase.from("applicant_profiles").insert({ user_id: userId });
      return {
        user_id: userId,
        personal: {},
        academics: {},
        testing: {},
        activities: [],
        essays: {},
        recommendations: [],
        preferences: {},
        status: "in_progress",
      };
    }
    return data;
  });

export const saveSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ section: sectionKey, data: z.unknown() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const schema = sectionSchemas[data.section];
    const parsed = schema.parse(data.data);
    const payload = { [data.section]: parsed as never };
    const { error } = await supabase
      .from("applicant_profiles")
      .update(payload)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

function renderEmailHtml(args: {
  fullName: string;
  email: string;
  userId: string;
  profile: Record<string, unknown>;
}) {
  const sections = [
    ["Personal", args.profile.personal],
    ["Academics", args.profile.academics],
    ["Testing", args.profile.testing],
    ["Activities", args.profile.activities],
    ["Essays", args.profile.essays],
    ["Recommendations", args.profile.recommendations],
    ["Preferences", args.profile.preferences],
  ];
  const rows = sections
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid #eee;vertical-align:top;width:160px;font-weight:600;color:#1e1b4b">${label}</td>
          <td style="padding:14px 18px;border-bottom:1px solid #eee;font-family:ui-monospace,Menlo,monospace;font-size:12px;white-space:pre-wrap;color:#27272a">${escapeHtml(
            JSON.stringify(value ?? {}, null, 2),
          )}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;background:#f5f5fa;font-family:Inter,Arial,sans-serif;color:#1e1b4b">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px -10px rgba(40,30,90,0.18)">
        <tr><td style="padding:28px 28px 8px">
          <div style="font-size:13px;color:#7c3aed;font-weight:600;letter-spacing:0.04em">UPPSEEKERS · COMMON ADMISSION APP</div>
          <h1 style="font-size:22px;margin:8px 0 6px">New applicant submission</h1>
          <p style="margin:0;color:#555">${escapeHtml(args.fullName)} &lt;${escapeHtml(args.email)}&gt; · <span style="color:#999">${escapeHtml(args.userId)}</span></p>
        </td></tr>
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#fafaff;color:#666;font-size:12px">
          Auto-sent by Uppseekers CAA. Reply directly to the applicant to start the path discussion.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

async function sendAdvisorEmail(html: string, subject: string) {
  const token = process.env.ZEPTOMAIL_TOKEN;
  const from = process.env.ZEPTOMAIL_FROM_EMAIL;
  const region = (process.env.ZEPTOMAIL_REGION || "in").toLowerCase();
  if (!token || !from) {
    console.warn("[uppseekers] ZeptoMail env missing — skipping advisor email send");
    return { sent: false, reason: "missing_env" as const };
  }
  const host = region === "com" ? "api.zeptomail.com" : `api.zeptomail.${region}`;
  const authHeader = token.startsWith("Zoho-enczapikey ") ? token : `Zoho-enczapikey ${token}`;
  const res = await fetch(`https://${host}/v1.1/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      from: { address: from, name: "Uppseekers CAA" },
      to: [{ email_address: { address: ADVISOR_EMAIL, name: "Akash" } }],
      subject,
      htmlbody: html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("[uppseekers] zeptomail send failed", res.status, text);
    return { sent: false, reason: "send_failed" as const };
  }
  return { sent: true };
}

export const submitProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile, error } = await supabase
      .from("applicant_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error || !profile) throw new Error(error?.message ?? "Profile not found");

    const { data: userInfo } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = userInfo.user?.email ?? "unknown";
    const personal = (profile.personal ?? {}) as { full_name?: string };
    const fullName =
      personal.full_name ||
      (userInfo.user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
      email;

    const html = renderEmailHtml({ fullName, email, userId, profile });
    const subject = `New Uppseekers applicant — ${fullName}`;

    const sendResult = await sendAdvisorEmail(html, subject);

    await supabase
      .from("applicant_profiles")
      .update({ status: "submitted", submitted_at: new Date().toISOString() })
      .eq("user_id", userId);

    return { ok: true, emailSent: sendResult.sent };
  });
