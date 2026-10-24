import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  kind: z.enum(["consultation", "callback"]),
  name: z.string().trim().max(100).optional().default(""),
  email: z.string().trim().max(255).optional().default(""),
  phone: z.string().trim().min(7).max(20).regex(/^[+\d\s()-]+$/, "Invalid phone"),
  grade: z.string().trim().max(50).optional().default(""),
  who: z.string().trim().max(20).optional().default(""),
  studentClass: z.string().trim().max(10).optional().default(""),
  board: z.string().trim().max(50).optional().default(""),
  interest: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
});

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => leadSchema.parse(d))
  .handler(async ({ data }) => {
    const token = process.env.ZEPTOMAIL_TOKEN;
    const from = process.env.ZEPTOMAIL_FROM_EMAIL;
    const region = (process.env.ZEPTOMAIL_REGION || "in").toLowerCase();
    if (!token || !from) return { ok: false };
    const host = region === "com" ? "api.zeptomail.com" : `api.zeptomail.${region}`;
    const auth = token.startsWith("Zoho-enczapikey ") ? token : `Zoho-enczapikey ${token}`;
    const rows = Object.entries(data)
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#64748b">${esc(k)}</td><td style="padding:6px 12px">${esc(String(v))}</td></tr>`)
      .join("");
    const res = await fetch(`https://${host}/v1.1/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: auth },
      body: JSON.stringify({
        from: { address: from, name: "Uppseekers Website" },
        to: [{ email_address: { address: "team@uppseekers.com", name: "Uppseekers Team" } }],
        subject: data.kind === "callback" ? `Callback request: ${data.phone}` : `Consultation request: ${data.name || data.phone}`,
        htmlbody: `<h2 style="font-family:sans-serif">New ${data.kind} lead</h2><table style="font-family:sans-serif;font-size:14px">${rows}</table>`,
      }),
    });
    if (!res.ok) console.error("[uppseekers] lead email failed", res.status, await res.text());
    return { ok: res.ok };
  });
