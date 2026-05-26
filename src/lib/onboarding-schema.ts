import { z } from "zod";

const shortText = z.string().max(255).optional();
const mediumText = z.string().max(2000).optional();
const longText = z.string().max(20000).optional();

export const personalSchema = z.object({
  full_name: z.string().min(1).max(120),
  date_of_birth: shortText,
  gender: shortText,
  nationality: shortText,
  phone: shortText,
  city: shortText,
  country: shortText,
  parent_name: shortText,
  parent_email: z.string().max(255).email().optional().or(z.literal("")),
  parent_phone: z.string().min(5, "Parent's phone is required").max(40),
});

export const academicsSchema = z.object({
  school_name: shortText,
  curriculum: shortText,
  grade: shortText,
  gpa: shortText,
  gpa_scale: shortText,
  class_rank: shortText,
  graduation_year: shortText,
  honors_courses: mediumText,
  notable_subjects: mediumText,
});

export const testingSchema = z.object({
  sat_total: shortText,
  sat_math: shortText,
  sat_ebrw: shortText,
  act: shortText,
  toefl: shortText,
  ielts: shortText,
  duolingo: shortText,
  ap_scores: mediumText,
  other_tests: mediumText,
});

export const activityItemSchema = z.object({
  name: z.string().min(1).max(255),
  role: shortText,
  category: shortText,
  hours_per_week: shortText,
  weeks_per_year: shortText,
  grades: shortText,
  description: mediumText,
});
export const activitiesSchema = z.array(activityItemSchema).max(50);

export const essaysSchema = z.object({
  common_essay: longText,
  why_us: longText,
  additional_info: longText,
});

export const recommendationItemSchema = z.object({
  recommender_name: shortText,
  recommender_role: shortText,
  recommender_email: z.string().max(255).email().optional().or(z.literal("")),
  relationship: shortText,
});
export const recommendationsSchema = z.array(recommendationItemSchema).max(20);

export const preferencesSchema = z.object({
  intended_majors: mediumText,
  preferred_countries: mediumText,
  budget_range: shortText,
  university_list: longText,
  notes: longText,
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
