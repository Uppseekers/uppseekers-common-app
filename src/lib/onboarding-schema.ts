import { z } from "zod";

export const personalSchema = z.object({
  full_name: z.string().min(1).max(120),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  parent_name: z.string().optional(),
  parent_email: z.string().email().optional().or(z.literal("")),
  parent_phone: z.string().optional(),
});

export const academicsSchema = z.object({
  school_name: z.string().optional(),
  curriculum: z.string().optional(), // IB / CBSE / A-Levels / AP
  grade: z.string().optional(),
  gpa: z.string().optional(),
  gpa_scale: z.string().optional(),
  class_rank: z.string().optional(),
  graduation_year: z.string().optional(),
  honors_courses: z.string().optional(),
  notable_subjects: z.string().optional(),
});

export const testingSchema = z.object({
  sat_total: z.string().optional(),
  sat_math: z.string().optional(),
  sat_ebrw: z.string().optional(),
  act: z.string().optional(),
  toefl: z.string().optional(),
  ielts: z.string().optional(),
  duolingo: z.string().optional(),
  ap_scores: z.string().optional(),
  other_tests: z.string().optional(),
});

export const activityItemSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  category: z.string().optional(),
  hours_per_week: z.string().optional(),
  weeks_per_year: z.string().optional(),
  grades: z.string().optional(),
  description: z.string().optional(),
});
export const activitiesSchema = z.array(activityItemSchema);

export const essaysSchema = z.object({
  common_essay: z.string().optional(),
  why_us: z.string().optional(),
  additional_info: z.string().optional(),
});

export const recommendationItemSchema = z.object({
  recommender_name: z.string().optional(),
  recommender_role: z.string().optional(),
  recommender_email: z.string().email().optional().or(z.literal("")),
  relationship: z.string().optional(),
});
export const recommendationsSchema = z.array(recommendationItemSchema);

export const preferencesSchema = z.object({
  intended_majors: z.string().optional(),
  preferred_countries: z.string().optional(),
  budget_range: z.string().optional(),
  university_list: z.string().optional(),
  notes: z.string().optional(),
});

export const SECTION_KEYS = [
  "personal",
  "academics",
  "testing",
  "activities",
  "essays",
  "recommendations",
  "preferences",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];
