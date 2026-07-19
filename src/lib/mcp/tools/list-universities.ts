import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_universities",
  title: "List universities",
  description:
    "List universities from the Uppseekers weightage catalog, optionally filtered by country or course, with rank, country, minimum profile score, and category weights.",
  inputSchema: {
    country: z.string().trim().min(1).max(64).optional().describe("Filter by country name (case-insensitive contains match)."),
    course_key: z.string().trim().min(1).max(64).optional().describe("Filter by course key (e.g. cs, ds, business, finance)."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ country, course_key, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("university_weights")
      .select(
        "rank, university, country, course_key, minimum_profile_score, academics_weight, supercurricular_weight, extracurricular_weight, cocurricular_weight, essay_sop_weight, projects_weight, leadership_weight, cutoff_notes",
      )
      .order("rank", { ascending: true })
      .limit(limit ?? 25);
    if (country) q = q.ilike("country", `%${country}%`);
    if (course_key) q = q.eq("course_key", course_key);
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { universities: data ?? [] },
    };
  },
});
