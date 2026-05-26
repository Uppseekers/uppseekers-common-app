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
import {
  scoreApplicant,
  buildShortlist,
  type UniversityWeightRow,
  type ShortlistEntry,
  type ScoreBreakdown,
} from "./university-matcher";
import { buildBrandedPdf, type EssayReview } from "./pdf-report";

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

const RETRY_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
const UNLIMITED_DOMAIN = "@uppseekers.com";

function isUnlimitedEmail(email: string | null | undefined) {
  return !!email && email.toLowerCase().endsWith(UNLIMITED_DOMAIN);
}

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

export const startRetry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: userInfo } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = userInfo.user?.email ?? "";
    if (!isUnlimitedEmail(email)) {
      throw new Error("Retries are limited to internal Uppseekers accounts. You can retry after 90 days.");
    }
    const { error: upErr } = await supabase
      .from("applicant_profiles")
      .update({ status: "in_progress" })
      .eq("user_id", userId);
    if (upErr) throw new Error(upErr.message);
    return { ok: true };
  });

async function callEssayReview(args: { common: string; whyUs: string; additional: string }): Promise<EssayReview | null> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return null;
  const hasContent = (args.common + args.whyUs + args.additional).trim().length > 80;
  if (!hasContent) return null;
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a senior US/UK admissions reader. Rate the applicant's essays on uniqueness (originality + voice + likelihood it isn't AI/template) and compelling power (memorability and admissions impact). Always return tool call output.",
          },
          {
            role: "user",
            content: `Personal essay:\n${args.common || "(empty)"}\n\nWhy us / Why major:\n${args.whyUs || "(empty)"}\n\nAdditional info:\n${args.additional || "(empty)"}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "review_essays",
              description: "Return structured essay evaluation.",
              parameters: {
                type: "object",
                properties: {
                  uniqueness_rating: { type: "number", description: "0-10 score for originality and likelihood it is the student's own voice." },
                  compelling_rating: { type: "number", description: "0-10 score for memorability and admissions impact." },
                  overall_rating: { type: "number", description: "0-10 overall essay rating." },
                  summary: { type: "string", description: "2-3 sentence overall assessment." },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 concrete, actionable suggestions to improve the essays.",
                  },
                },
                required: ["uniqueness_rating", "compelling_rating", "overall_rating", "summary", "suggestions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "review_essays" } },
      }),
    });
    if (!res.ok) {
      console.error("[uppseekers] essay review failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const json = await res.json();
    const tc = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) return null;
    const parsed = JSON.parse(tc.function?.arguments || "{}");
    return {
      rating: Math.round(parsed.overall_rating ?? 0),
      uniquenessRating: Math.round(parsed.uniqueness_rating ?? 0),
      compellingRating: Math.round(parsed.compelling_rating ?? 0),
      summary: String(parsed.summary || ""),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map((s: unknown) => String(s)).slice(0, 5) : [],
    };
  } catch (e) {
    console.error("[uppseekers] essay review error", e);
    return null;
  }
}

async function buildPrioritizedShortlist(
  breakdown: ScoreBreakdown,
  preferences: { preferred_countries?: string; university_list?: string } | undefined,
): Promise<ShortlistEntry[]> {
  const { data: weights } = await supabaseAdmin
    .from("university_weights")
    .select("rank,university,country,logo_url,course_key,academics_weight,supercurricular_weight,extracurricular_weight,cocurricular_weight,essay_sop_weight,projects_weight,leadership_weight,minimum_profile_score,cutoff_notes")
    .eq("course_key", "all");
  if (!weights?.length) return [];
  return buildShortlist(breakdown, weights as unknown as UniversityWeightRow[], {
    preferredCountries: preferences?.preferred_countries,
    preferredUniversities: preferences?.university_list,
  });
}

function renderShortlistHtml(applicantScore: number, shortlist: ShortlistEntry[]): string {
  if (!shortlist.length) return "";
  const tone = (t: string) =>
    t === "Dream" ? "background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5"
    : t === "Reach" ? "background:#ffedd5;color:#9a3412;border:1px solid #fdba74"
    : t === "Target" ? "background:#fef3c7;color:#92400e;border:1px solid #fcd34d"
    : "background:#dcfce7;color:#166534;border:1px solid #86efac";
  const cards = shortlist.map((s) => `
    <td style="padding:8px;vertical-align:top" width="50%">
      <div style="border:1px solid #eee;border-radius:14px;padding:14px 16px;background:#fff">
        <table width="100%"><tr>
          <td><div style="font-weight:600;color:#1e1b4b;font-size:14px">${escapeHtml(s.university)}</div>
              <div style="font-size:11px;color:#888;margin-top:2px">${escapeHtml(s.country)}</div></td>
          <td align="right"><span style="font-size:10px;padding:3px 8px;border-radius:999px;${tone(s.tier)}">${s.tier}</span></td>
        </tr></table>
        <div style="margin-top:10px">
          <span style="font-size:22px;font-weight:600;color:#1e1b4b">${s.match}<span style="font-size:12px;color:#999">%</span></span>
          <span style="font-size:10px;color:#999;margin-left:8px">chance · score ${s.weightedScore} / req ${s.benchmark}</span>
        </div>
        ${s.cutoffNotes ? `<div style="font-size:10px;color:#888;margin-top:3px">${escapeHtml(s.cutoffNotes)}</div>` : ""}
        <div style="margin-top:6px;height:5px;background:#eee;border-radius:999px;overflow:hidden">
          <div style="width:${s.match}%;height:100%;background:linear-gradient(90deg,#7c3aed,#a855f7)"></div>
        </div>
      </div>
    </td>`);
  const rows: string[] = [];
  for (let i = 0; i < cards.length; i += 2) rows.push(`<tr>${cards[i] || ""}${cards[i + 1] || `<td width="50%"></td>`}</tr>`);
  return `
    <tr><td style="padding:18px 28px 0">
      <div style="font-size:13px;color:#7c3aed;font-weight:600;letter-spacing:0.04em">UNIVERSITY SHORTLIST · PRIORITIZED</div>
      <div style="margin-top:6px;color:#444;font-size:13px">Applicant readiness: <strong style="color:#1e1b4b">${applicantScore}/100</strong></div>
    </td></tr>
    <tr><td style="padding:8px 20px 24px"><table width="100%">${rows.join("")}</table></td></tr>`;
}

function renderEmailHtml(args: {
  fullName: string; email: string; userId: string;
  profile: Record<string, unknown>; shortlistHtml?: string; essayReview?: EssayReview | null;
}) {
  const sections = [
    ["Personal", args.profile.personal], ["Academics", args.profile.academics],
    ["Testing", args.profile.testing], ["Activities", args.profile.activities],
    ["Essays", args.profile.essays], ["Recommendations", args.profile.recommendations],
    ["Preferences", args.profile.preferences],
  ];
  const rows = sections.map(([label, value]) => `
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid #eee;vertical-align:top;width:160px;font-weight:600;color:#1e1b4b">${label}</td>
          <td style="padding:14px 18px;border-bottom:1px solid #eee;font-family:ui-monospace,Menlo,monospace;font-size:12px;white-space:pre-wrap;color:#27272a">${escapeHtml(JSON.stringify(value ?? {}, null, 2))}</td>
        </tr>`).join("");

  const essayBlock = args.essayReview ? `
    <tr><td style="padding:18px 28px 4px">
      <div style="font-size:13px;color:#7c3aed;font-weight:600;letter-spacing:0.04em">ESSAY REVIEW</div>
      <div style="margin-top:6px;font-size:13px;color:#1e1b4b">
        Overall <strong>${args.essayReview.rating}/10</strong> · Uniqueness <strong>${args.essayReview.uniquenessRating}/10</strong> · Compelling <strong>${args.essayReview.compellingRating}/10</strong>
      </div>
      <div style="margin-top:6px;font-size:12px;color:#444">${escapeHtml(args.essayReview.summary)}</div>
      <ul style="margin:8px 0 0;padding-left:18px;font-size:12px;color:#444">
        ${args.essayReview.suggestions.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
      </ul>
    </td></tr>` : "";

  return `<!doctype html><html><body style="margin:0;background:#f5f5fa;font-family:Inter,Arial,sans-serif;color:#1e1b4b">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0"><tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px -10px rgba(40,30,90,0.18)">
        <tr><td style="padding:28px 28px 8px">
          <div style="font-size:13px;color:#7c3aed;font-weight:600;letter-spacing:0.04em">UPPSEEKERS · COMMON ADMISSION APP</div>
          <h1 style="font-size:22px;margin:8px 0 6px">New applicant submission</h1>
          <p style="margin:0;color:#555">${escapeHtml(args.fullName)} &lt;${escapeHtml(args.email)}&gt;</p>
        </td></tr>
        <tr><td><table width="100%">${rows}</table></td></tr>
        ${essayBlock}
        ${args.shortlistHtml || ""}
        <tr><td style="padding:18px 28px;background:#fafaff;color:#666;font-size:12px">Auto-sent by Uppseekers CAA. A branded PDF report is attached.</td></tr>
      </table>
    </td></tr></table></body></html>`;
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // btoa is available on the Worker runtime
  return typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bytes).toString("base64");
}

async function sendAdvisorEmail(html: string, subject: string, attachment?: { name: string; base64: string }) {
  const token = process.env.ZEPTOMAIL_TOKEN;
  const from = process.env.ZEPTOMAIL_FROM_EMAIL;
  const region = (process.env.ZEPTOMAIL_REGION || "in").toLowerCase();
  if (!token || !from) {
    console.warn("[uppseekers] ZeptoMail env missing — skipping advisor email send");
    return { sent: false, reason: "missing_env" as const };
  }
  const host = region === "com" ? "api.zeptomail.com" : `api.zeptomail.${region}`;
  const authHeader = token.startsWith("Zoho-enczapikey ") ? token : `Zoho-enczapikey ${token}`;
  const body: Record<string, unknown> = {
    from: { address: from, name: "Uppseekers CAA" },
    to: [{ email_address: { address: ADVISOR_EMAIL, name: "Akash" } }],
    subject, htmlbody: html,
  };
  if (attachment) {
    body.attachments = [{ content: attachment.base64, mime_type: "application/pdf", name: attachment.name }];
  }
  const res = await fetch(`https://${host}/v1.1/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("[uppseekers] zeptomail send failed", res.status, await res.text());
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
    const unlimited = isUnlimitedEmail(email);

    if (!unlimited && profile.submitted_at) {
      const elapsed = Date.now() - new Date(profile.submitted_at).getTime();
      if (elapsed < RETRY_COOLDOWN_MS) {
        throw new Error("You can retry after 90 days.");
      }
    }

    const submittedAt = new Date().toISOString();
    const { error: claimError } = await supabase
      .from("applicant_profiles")
      .update({ status: "submitted", submitted_at: submittedAt })
      .eq("user_id", userId);
    if (claimError) throw new Error(claimError.message);

    const personal = (profile.personal ?? {}) as { full_name?: string };
    const fullName = personal.full_name ||
      (userInfo.user?.user_metadata as { full_name?: string } | undefined)?.full_name || email;

    const breakdown = scoreApplicant(profile as never);
    const preferences = (profile.preferences ?? {}) as { preferred_countries?: string; university_list?: string; intended_majors?: string };
    const essays = (profile.essays ?? {}) as { common_essay?: string; why_us?: string; additional_info?: string };

    const [shortlist, essayReview] = await Promise.all([
      buildPrioritizedShortlist(breakdown, preferences).catch((e) => { console.error(e); return [] as ShortlistEntry[]; }),
      callEssayReview({ common: essays.common_essay || "", whyUs: essays.why_us || "", additional: essays.additional_info || "" }),
    ]);

    // Persist AI review + computed shortlist for later PDF downloads
    try {
      await supabaseAdmin.from("applicant_profiles").update({
        essays: { ...essays, ai_review: essayReview },
        preferences: { ...preferences, computed_shortlist: shortlist, readiness_score: breakdown },
      }).eq("user_id", userId);
    } catch (e) { console.error("[uppseekers] persist review failed", e); }

    let pdfBase64 = "";
    try {
      const pdfBytes = await buildBrandedPdf({
        fullName, email, score: breakdown, shortlist, essayReview,
        preferences: {
          intended_majors: preferences.intended_majors,
          preferred_countries: preferences.preferred_countries,
          university_list: preferences.university_list,
        },
      });
      pdfBase64 = bytesToBase64(pdfBytes);
    } catch (e) { console.error("[uppseekers] pdf generation failed", e); }

    const shortlistHtml = renderShortlistHtml(breakdown.total, shortlist);
    const html = renderEmailHtml({ fullName, email, userId, profile, shortlistHtml, essayReview });
    const subject = `New Uppseekers applicant — ${fullName} · ${breakdown.total}/100`;

    const sendResult = await sendAdvisorEmail(
      html, subject,
      pdfBase64 ? { name: `uppseekers-${userId.slice(0, 8)}.pdf`, base64: pdfBase64 } : undefined,
    );

    return { ok: true, emailSent: sendResult.sent, pdfBase64 };
  });

export const downloadReportPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile, error } = await supabase
      .from("applicant_profiles").select("*").eq("user_id", userId).single();
    if (error || !profile) throw new Error(error?.message ?? "Profile not found");
    const { data: userInfo } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = userInfo.user?.email ?? "";
    const personal = (profile.personal ?? {}) as { full_name?: string };
    const fullName = personal.full_name || email;
    const essays = (profile.essays ?? {}) as { common_essay?: string; why_us?: string; additional_info?: string; ai_review?: EssayReview };
    const preferences = (profile.preferences ?? {}) as {
      preferred_countries?: string; university_list?: string; intended_majors?: string;
      computed_shortlist?: ShortlistEntry[]; readiness_score?: ScoreBreakdown;
    };
    const breakdown = preferences.readiness_score ?? scoreApplicant(profile as never);
    const shortlist = preferences.computed_shortlist?.length
      ? preferences.computed_shortlist
      : await buildPrioritizedShortlist(breakdown, preferences);
    const pdfBytes = await buildBrandedPdf({
      fullName, email, score: breakdown, shortlist, essayReview: essays.ai_review ?? null,
      preferences: {
        intended_majors: preferences.intended_majors,
        preferred_countries: preferences.preferred_countries,
        university_list: preferences.university_list,
      },
    });
    return { pdfBase64: bytesToBase64(pdfBytes) };
  });
