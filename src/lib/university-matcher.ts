// Pure logic for scoring an applicant profile (0-100) and matching
// against the university_benchmarks reference table.

export interface ScoreBreakdown {
  q1: number; q2: number; q3: number; q4: number; q5: number;
  q6: number; q7: number; q8: number; q9: number; q10: number;
  total: number;
}

export const MAX_SCORES = {
  q1: 40, q2: 7.5, q3: 7.5, q4: 11.2, q5: 7.5,
  q6: 7.5, q7: 3.8, q8: 3.8, q9: 3.8, q10: 7.5,
};

type Profile = {
  academics?: Record<string, unknown>;
  testing?: Record<string, unknown>;
  activities?: Array<Record<string, unknown>>;
  essays?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
};

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const str = (v: unknown) => (typeof v === "string" ? v.toLowerCase() : "");

function scoreAcademics(academics: Profile["academics"]): number {
  const gpa = num(academics?.gpa);
  const scaleRaw = str(academics?.gpa_scale);
  if (gpa === null) return 0;
  // normalize to 4.0 scale
  let pct = 0;
  if (scaleRaw.includes("100") || gpa > 10) pct = gpa; // percentage
  else if (scaleRaw.includes("10") || (gpa <= 10 && gpa > 4)) pct = gpa * 10;
  else pct = (gpa / 4) * 100;
  if (pct >= 95) return 40;
  if (pct >= 90) return 34;
  if (pct >= 85) return 28;
  if (pct >= 80) return 20;
  return 10;
}

function scoreCoursework(academics: Profile["academics"], testing: Profile["testing"]): number {
  const honors = str(academics?.honors_courses);
  const aps = str(testing?.ap_scores);
  const advancedCount =
    (honors.match(/\b(ap|ib hl|honors|advanced)\b/g)?.length || 0) +
    (aps.split(/[,;\n]/).filter((x) => x.trim().length > 0).length);
  if (advancedCount >= 3) return 7.5;
  if (advancedCount === 2) return 5.2;
  if (advancedCount === 1) return 3;
  return 0;
}

const matchAny = (text: string, keywords: string[]) =>
  keywords.some((k) => text.includes(k));

function activityScore(
  activities: Profile["activities"] = [],
  keywords: string[],
  tiers: [number, number, number, number],
): number {
  const count = activities.filter((a) => {
    const blob = (str(a?.name) + " " + str(a?.role) + " " + str(a?.category) + " " + str(a?.description));
    return matchAny(blob, keywords);
  }).length;
  if (count >= 3) return tiers[0];
  if (count === 2) return tiers[1];
  if (count === 1) return tiers[2];
  return tiers[3];
}

export function scoreApplicant(profile: Profile): ScoreBreakdown {
  const q1 = scoreAcademics(profile.academics);
  const q2 = scoreCoursework(profile.academics, profile.testing);
  const q3 = activityScore(profile.activities, ["olympiad", "competition", "hackathon", "contest", "tournament"], [7.5, 5.2, 3, 0]);
  const q4 = activityScore(profile.activities, ["research", "project", "paper", "publication", "thesis"], [11.2, 9, 6.8, 3.8]);
  const q5 = activityScore(profile.activities, ["python", "excel", "modeling", "data", "sql", "java", "c++", "tableau"], [7.5, 5.2, 3, 1.5]);
  const q6 = activityScore(profile.activities, ["internship", "intern", "startup", "company", "firm"], [7.5, 5.2, 3, 1.5]);

  // q7 — foundations (SAT math / ACT / olympiad)
  const satMath = num(profile.testing?.sat_math) ?? 0;
  const act = num(profile.testing?.act) ?? 0;
  let q7 = 0.8;
  if (satMath >= 750 || act >= 33) q7 = 3.8;
  else if (satMath >= 700 || act >= 30) q7 = 2.2;

  const q8 = activityScore(profile.activities, ["award", "national", "international", "intl", "winner", "medal"], [3.8, 2.2, 1.5, 0]);
  const q9 = activityScore(profile.activities, ["volunteer", "community", "ngo", "impact", "social", "charity"], [3.8, 2.2, 0.8, 0]);
  const q10 = activityScore(profile.activities, ["mooc", "coursera", "edx", "udemy", "certification", "certificate", "khan"], [7.5, 5.2, 3, 0.8]);

  const total = Math.round((q1 + q2 + q3 + q4 + q5 + q6 + q7 + q8 + q9 + q10) * 10) / 10;
  return { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, total };
}

const COURSE_KEYS = ["cs-ai", "ds-stats", "business", "finance-eco"] as const;
export type CourseKey = (typeof COURSE_KEYS)[number];

export function inferCourseKey(intendedMajors?: string): CourseKey {
  const m = (intendedMajors || "").toLowerCase();
  if (/(data\s*sci|statistic|analytics|machine learning|\bml\b)/.test(m)) return "ds-stats";
  if (/(finance|economics|econ|accounting|investment|banking)/.test(m)) return "finance-eco";
  if (/(business|management|mba|marketing|entrepreneur|commerce)/.test(m)) return "business";
  if (/(computer|cs|software|ai|artificial|engineering|tech|robotic)/.test(m)) return "cs-ai";
  return "cs-ai";
}

export interface BenchmarkRow {
  course_key: string;
  rank: number;
  university: string;
  country: string | null;
  total: number;
}

export type Tier = "Dream" | "Reach" | "Target" | "Safe";

export interface ShortlistEntry {
  university: string;
  country: string;
  tier: Tier;
  match: number; // 0-100
  benchmark: number;
  gap: number;
}

function tierAndMatch(gap: number): { tier: Tier; match: number } {
  if (gap <= 0) return { tier: "Safe", match: Math.min(99, 90 + Math.min(9, -gap)) };
  if (gap <= 10) return { tier: "Target", match: Math.round(80 - gap * 2) };
  if (gap <= 20) return { tier: "Reach", match: Math.round(55 - (gap - 10) * 2.5) };
  return { tier: "Dream", match: Math.max(8, Math.round(25 - (gap - 20))) };
}

export function buildShortlist(applicantTotal: number, rows: BenchmarkRow[]): ShortlistEntry[] {
  const scored: ShortlistEntry[] = rows.map((r) => {
    const gap = r.total - applicantTotal;
    const { tier, match } = tierAndMatch(gap);
    return {
      university: r.university,
      country: r.country || "",
      tier,
      match,
      benchmark: r.total,
      gap: Math.round(gap * 10) / 10,
    };
  });

  const byTier = (t: Tier) =>
    scored.filter((s) => s.tier === t).sort((a, b) => b.benchmark - a.benchmark);

  // 4 Dream (highest-ranked aspirational), 5 Target, 3 Safe
  return [
    ...byTier("Dream").slice(0, 4),
    ...byTier("Reach").slice(0, 2),
    ...byTier("Target").slice(0, 4),
    ...byTier("Safe").slice(0, 3),
  ];
}
