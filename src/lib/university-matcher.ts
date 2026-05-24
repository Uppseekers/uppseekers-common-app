// Pure logic for scoring an applicant profile by weighted readiness categories.

export interface ScoreBreakdown {
  academics: number;
  supercurricular: number;
  extracurricular: number;
  cocurricular: number;
  essaySop: number;
  projects: number;
  leadership: number;
  total: number;
}

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
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function scoreAcademics(academics: Profile["academics"], testing: Profile["testing"]): number {
  const gpa = num(academics?.gpa);
  const scaleRaw = str(academics?.gpa_scale);
  let score = 20;
  if (gpa !== null) {
    let pct = 0;
    if (scaleRaw.includes("100") || gpa > 10) pct = gpa;
    else if (scaleRaw.includes("10") || (gpa <= 10 && gpa > 4)) pct = gpa * 10;
    else pct = (gpa / 4) * 100;
    score = pct >= 95 ? 92 : pct >= 90 ? 82 : pct >= 85 ? 70 : pct >= 80 ? 55 : 38;
  }
  const sat = num(testing?.sat_total) ?? 0;
  const act = num(testing?.act) ?? 0;
  if (sat >= 1500 || act >= 34) score += 8;
  else if (sat >= 1400 || act >= 31) score += 5;
  else if (sat >= 1300 || act >= 28) score += 3;
  if (str(academics?.honors_courses).match(/\b(ap|ib hl|honors|advanced|a-level)\b/)) score += 5;
  return clamp(score);
}

const matchAny = (text: string, keywords: string[]) =>
  keywords.some((k) => text.includes(k));

function activityScore(
  activities: Profile["activities"] = [],
  keywords: string[],
  bonusKeywords: string[] = [],
): number {
  const matched = activities.filter((a) => {
    const blob = (str(a?.name) + " " + str(a?.role) + " " + str(a?.category) + " " + str(a?.description));
    return matchAny(blob, keywords);
  });
  const impact = matched.filter((a) => {
    const blob = (str(a?.role) + " " + str(a?.description));
    return matchAny(blob, ["national", "international", "winner", "award", "impact", "published", "selected", ...bonusKeywords]);
  }).length;
  return clamp(matched.length * 24 + impact * 10);
}

function scoreEssays(essays: Profile["essays"]): number {
  const common = str(essays?.common_essay);
  const why = str(essays?.why_us);
  const info = str(essays?.additional_info);
  return clamp((common.length > 500 ? 45 : common.length > 150 ? 30 : common.length > 0 ? 15 : 0) +
    (why.length > 350 ? 35 : why.length > 100 ? 22 : why.length > 0 ? 10 : 0) +
    (info.length > 100 ? 15 : info.length > 0 ? 8 : 0));
}

export function scoreApplicant(profile: Profile): ScoreBreakdown {
  const academics = scoreAcademics(profile.academics, profile.testing);
  const supercurricular = activityScore(profile.activities, ["olympiad", "competition", "research", "paper", "publication", "mooc", "coursera", "edx", "internship", "academic", "subject"]);
  const extracurricular = activityScore(profile.activities, ["sport", "music", "art", "dance", "theatre", "debate", "mun", "club", "job", "work", "volunteer", "ngo", "community"]);
  const cocurricular = activityScore(profile.activities, ["school", "house", "council", "prefect", "event", "committee", "magazine", "student", "club"]);
  const essaySop = scoreEssays(profile.essays);
  const projects = activityScore(profile.activities, ["project", "app", "website", "startup", "research", "paper", "model", "prototype", "portfolio", "github", "python", "data"]);
  const leadership = activityScore(profile.activities, ["founder", "president", "captain", "leader", "lead", "head", "organizer", "director", "coordinator", "prefect"]);
  const total = Math.round(((academics + supercurricular + extracurricular + cocurricular + essaySop + projects + leadership) / 7) * 10) / 10;
  return { academics, supercurricular, extracurricular, cocurricular, essaySop, projects, leadership, total };
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

export interface UniversityWeightRow {
  id?: string;
  course_key: string;
  rank: number;
  university: string;
  country: string | null;
  logo_url?: string | null;
  academics_weight: number;
  supercurricular_weight: number;
  extracurricular_weight: number;
  cocurricular_weight: number;
  essay_sop_weight: number;
  projects_weight: number;
  leadership_weight: number;
  minimum_profile_score: number;
  cutoff_notes?: string | null;
}

export type Tier = "Dream" | "Reach" | "Target" | "Safe";

export interface ShortlistEntry {
  university: string;
  country: string;
  tier: Tier;
  match: number; // 0-100
  benchmark: number;
  gap: number;
  logoUrl?: string;
  cutoffNotes?: string;
  weightedScore: number;
}

function tierAndMatch(gap: number): { tier: Tier; match: number } {
  if (gap <= 0) return { tier: "Safe", match: Math.min(98, Math.round(88 + Math.min(10, -gap * 0.8))) };
  if (gap <= 8) return { tier: "Target", match: Math.round(82 - gap * 2.3) };
  if (gap <= 18) return { tier: "Reach", match: Math.round(58 - (gap - 8) * 2.2) };
  return { tier: "Dream", match: Math.max(8, Math.round(32 - (gap - 18) * 1.1)) };
}

function weightedScore(score: ScoreBreakdown, row: UniversityWeightRow): number {
  const total =
    (score.academics * row.academics_weight) +
    (score.supercurricular * row.supercurricular_weight) +
    (score.extracurricular * row.extracurricular_weight) +
    (score.cocurricular * row.cocurricular_weight) +
    (score.essaySop * row.essay_sop_weight) +
    (score.projects * row.projects_weight) +
    (score.leadership * row.leadership_weight);
  const weightSum = row.academics_weight + row.supercurricular_weight + row.extracurricular_weight + row.cocurricular_weight + row.essay_sop_weight + row.projects_weight + row.leadership_weight;
  return Math.round((total / Math.max(1, weightSum)) * 10) / 10;
}

export function buildShortlist(score: ScoreBreakdown, rows: UniversityWeightRow[]): ShortlistEntry[] {
  const scored: ShortlistEntry[] = rows.map((r) => {
    const applicantWeightedScore = weightedScore(score, r);
    const gap = r.minimum_profile_score - applicantWeightedScore;
    const { tier, match } = tierAndMatch(gap);
    return {
      university: r.university,
      country: r.country || "",
      tier,
      match,
      benchmark: r.minimum_profile_score,
      gap: Math.round(gap * 10) / 10,
      logoUrl: r.logo_url || undefined,
      cutoffNotes: r.cutoff_notes || undefined,
      weightedScore: applicantWeightedScore,
    };
  });

  const byTier = (t: Tier) =>
    scored.filter((s) => s.tier === t).sort((a, b) => b.match - a.match || a.gap - b.gap);

  return [
    ...byTier("Dream").slice(0, 4),
    ...byTier("Reach").slice(0, 2),
    ...byTier("Target").slice(0, 4),
    ...byTier("Safe").slice(0, 3),
  ];
}
