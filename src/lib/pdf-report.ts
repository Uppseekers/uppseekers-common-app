// Branded PDF report generator (Worker-safe via pdf-lib).
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ScoreBreakdown, ShortlistEntry } from "./university-matcher";

export interface EssayReview {
  rating: number; // 0-10
  uniquenessRating: number; // 0-10
  compellingRating: number; // 0-10
  suggestions: string[];
  summary: string;
}

export interface PdfReportInput {
  fullName: string;
  email: string;
  score: ScoreBreakdown;
  shortlist: ShortlistEntry[];
  essayReview?: EssayReview | null;
  preferences?: { intended_majors?: string; preferred_countries?: string; university_list?: string };
  applicantInputs?: {
    personal?: Record<string, unknown>;
    academics?: Record<string, unknown>;
    testing?: Record<string, unknown>;
    activities?: unknown[];
    essays?: Record<string, unknown>;
    recommendations?: unknown[];
    preferences?: Record<string, unknown>;
  };
}

// Brand palette derived from landing page tokens.
const BRAND = {
  bg: rgb(0.985, 0.984, 0.996),
  card: rgb(1, 1, 1),
  ink: rgb(0.12, 0.09, 0.29),
  inkSoft: rgb(0.36, 0.32, 0.5),
  muted: rgb(0.55, 0.55, 0.62),
  border: rgb(0.9, 0.9, 0.94),
  primary: rgb(0.42, 0.21, 0.86), // #6B36DC-ish
  primaryGlow: rgb(0.62, 0.4, 0.95),
  success: rgb(0.27, 0.66, 0.42),
  warning: rgb(0.91, 0.62, 0.18),
  danger: rgb(0.85, 0.27, 0.27),
};

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;

function tierColor(tier: string) {
  if (tier === "Safe") return BRAND.success;
  if (tier === "Target") return BRAND.warning;
  if (tier === "Reach") return rgb(0.95, 0.5, 0.25);
  return BRAND.danger;
}

function wrapText(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) > maxW) {
      if (line) lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

// Replace unsupported glyphs (StandardFonts only support WinAnsi)
function sanitize(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2026]/g, "...")
    .replace(/[\u00A0]/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA1-\xFF]/g, "");
}

export async function buildBrandedPdf(input: PdfReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const serif = await doc.embedFont(StandardFonts.TimesRomanItalic);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: BRAND.bg });

  let y = PAGE_H - MARGIN;

  // Header band
  page.drawRectangle({ x: 0, y: y - 80, width: PAGE_W, height: 80, color: BRAND.primary });
  page.drawText("UPPSEEKERS", { x: MARGIN, y: y - 30, size: 11, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Common Admission Profile Report", { x: MARGIN, y: y - 52, size: 18, font: serif, color: rgb(1, 1, 1) });
  page.drawText(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), {
    x: PAGE_W - MARGIN - 100, y: y - 30, size: 9, font: reg, color: rgb(1, 1, 1),
  });
  y -= 110;

  // Applicant
  page.drawText(sanitize(input.fullName) || "Applicant", { x: MARGIN, y, size: 22, font: bold, color: BRAND.ink });
  y -= 18;
  page.drawText(sanitize(input.email), { x: MARGIN, y, size: 10, font: reg, color: BRAND.muted });
  y -= 28;

  // Readiness score card
  drawCard(page, MARGIN, y - 110, PAGE_W - MARGIN * 2, 110);
  page.drawText("OVERALL READINESS", { x: MARGIN + 18, y: y - 22, size: 9, font: bold, color: BRAND.primary });
  const total = Math.round(input.score.total);
  page.drawText(`${total}`, { x: MARGIN + 18, y: y - 70, size: 44, font: bold, color: BRAND.ink });
  page.drawText("/ 100", { x: MARGIN + 18 + bold.widthOfTextAtSize(`${total}`, 44) + 6, y: y - 60, size: 12, font: reg, color: BRAND.muted });

  // Category mini-bars
  const cats: [string, number][] = [
    ["Academics", input.score.academics],
    ["Super-curricular", input.score.supercurricular],
    ["Extra-curricular", input.score.extracurricular],
    ["Co-curricular", input.score.cocurricular],
    ["Essays / SOP", input.score.essaySop],
    ["Projects", input.score.projects],
    ["Leadership", input.score.leadership],
  ];
  const colX = MARGIN + 200;
  const colW = PAGE_W - MARGIN * 2 - 220;
  cats.forEach((c, i) => {
    const row = i % 4;
    const col = Math.floor(i / 4);
    const cx = colX + col * (colW / 2 + 10);
    const cy = y - 18 - row * 22;
    const cw = colW / 2 - 20;
    page.drawText(c[0], { x: cx, y: cy, size: 8, font: reg, color: BRAND.inkSoft });
    page.drawText(`${Math.round(c[1])}`, { x: cx + cw - 18, y: cy, size: 8, font: bold, color: BRAND.ink });
    page.drawRectangle({ x: cx, y: cy - 5, width: cw, height: 3, color: BRAND.border });
    page.drawRectangle({ x: cx, y: cy - 5, width: cw * (c[1] / 100), height: 3, color: BRAND.primary });
  });
  y -= 130;

  // Essay review
  if (input.essayReview) {
    y -= 6;
    page.drawText("ESSAY REVIEW", { x: MARGIN, y, size: 10, font: bold, color: BRAND.primary });
    y -= 16;
    const r = input.essayReview;
    const cardH = 110 + Math.min(r.suggestions.length, 4) * 14;
    drawCard(page, MARGIN, y - cardH, PAGE_W - MARGIN * 2, cardH);
    const startY = y - 22;
    drawRatingPill(page, bold, reg, MARGIN + 18, startY, "Overall", r.rating);
    drawRatingPill(page, bold, reg, MARGIN + 18 + 110, startY, "Uniqueness", r.uniquenessRating);
    drawRatingPill(page, bold, reg, MARGIN + 18 + 220, startY, "Compelling", r.compellingRating);

    let ey = startY - 36;
    const summaryLines = wrapText(sanitize(r.summary), reg, 9, PAGE_W - MARGIN * 2 - 36);
    summaryLines.slice(0, 3).forEach((ln) => {
      page.drawText(ln, { x: MARGIN + 18, y: ey, size: 9, font: reg, color: BRAND.inkSoft });
      ey -= 12;
    });
    ey -= 6;
    page.drawText("Suggestions", { x: MARGIN + 18, y: ey, size: 9, font: bold, color: BRAND.ink });
    ey -= 14;
    r.suggestions.slice(0, 4).forEach((s) => {
      const lines = wrapText("• " + sanitize(s), reg, 9, PAGE_W - MARGIN * 2 - 36);
      lines.forEach((ln) => {
        if (ey < MARGIN + 30) return;
        page.drawText(ln, { x: MARGIN + 18, y: ey, size: 9, font: reg, color: BRAND.inkSoft });
        ey -= 11;
      });
    });
    y -= cardH + 16;
  }

  // University shortlist (new page if needed)
  if (y < 280) {
    page = doc.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: BRAND.bg });
    y = PAGE_H - MARGIN;
  }

  page.drawText("UNIVERSITY SHORTLIST", { x: MARGIN, y, size: 10, font: bold, color: BRAND.primary });
  y -= 6;
  page.drawText("Prioritized for your stated preferences", {
    x: MARGIN, y: y - 12, size: 9, font: reg, color: BRAND.muted,
  });
  y -= 28;

  for (const entry of input.shortlist) {
    if (y < MARGIN + 80) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: BRAND.bg });
      y = PAGE_H - MARGIN;
    }
    drawUniversityRow(page, bold, reg, MARGIN, y, PAGE_W - MARGIN * 2, entry);
    y -= 64;
  }

  // Preferences footer
  if (input.preferences && y > MARGIN + 60) {
    y -= 4;
    page.drawText("APPLICANT PREFERENCES", { x: MARGIN, y, size: 9, font: bold, color: BRAND.primary });
    y -= 14;
    const lines = [
      ["Intended majors", input.preferences.intended_majors],
      ["Preferred countries", input.preferences.preferred_countries],
      ["Target universities", input.preferences.university_list],
    ];
    for (const [k, v] of lines) {
      if (!v) continue;
      page.drawText(`${k}:`, { x: MARGIN, y, size: 8, font: bold, color: BRAND.inkSoft });
      const wrapped = wrapText(sanitize(v as string), reg, 8, PAGE_W - MARGIN * 2 - 100);
      wrapped.slice(0, 2).forEach((ln, idx) => {
        page.drawText(ln, { x: MARGIN + 100, y: y - idx * 10, size: 8, font: reg, color: BRAND.inkSoft });
      });
      y -= 12 + Math.min(wrapped.length - 1, 1) * 10;
    }
  }

  // Applicant inputs — full snapshot of what the student submitted
  if (input.applicantInputs) {
    page = doc.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: BRAND.bg });
    y = PAGE_H - MARGIN;
    page.drawText("APPLICANT INPUTS", { x: MARGIN, y, size: 10, font: bold, color: BRAND.primary });
    y -= 6;
    page.drawText("Everything the student submitted, as-is.", {
      x: MARGIN, y: y - 12, size: 9, font: reg, color: BRAND.muted,
    });
    y -= 26;

    const writeLine = (text: string, opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb>; indent?: number } = {}) => {
      const size = opts.size ?? 9;
      const f = opts.f ?? reg;
      const indent = opts.indent ?? 0;
      const wrapped = wrapText(sanitize(text), f, size, PAGE_W - MARGIN * 2 - indent);
      for (const ln of wrapped) {
        if (y < MARGIN + 30) {
          page = doc.addPage([PAGE_W, PAGE_H]);
          page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: BRAND.bg });
          y = PAGE_H - MARGIN;
        }
        page.drawText(ln, { x: MARGIN + indent, y, size, font: f, color: opts.color ?? BRAND.inkSoft });
        y -= size + 3;
      }
    };
    const heading = (label: string) => {
      y -= 6;
      writeLine(label.toUpperCase(), { size: 9, f: bold, color: BRAND.primary });
      y -= 2;
    };
    const kv = (label: string, value: unknown) => {
      const v = value == null || value === "" ? "—" : String(value);
      writeLine(`${label}: ${v}`, { indent: 4 });
    };
    const dumpObj = (obj?: Record<string, unknown>) => {
      if (!obj) return;
      Object.entries(obj)
        .filter(([k]) => !["computed_shortlist", "readiness_score", "ai_review"].includes(k))
        .forEach(([k, v]) => {
          if (v == null || v === "") return;
          if (typeof v === "object") kv(k, JSON.stringify(v));
          else kv(k.replace(/_/g, " "), v);
        });
    };

    const inp = input.applicantInputs;
    heading("Personal"); dumpObj(inp.personal);
    heading("Academics"); dumpObj(inp.academics);
    heading("Testing"); dumpObj(inp.testing);
    heading(`Activities (${inp.activities?.length ?? 0})`);
    (inp.activities ?? []).forEach((a, i) => {
      const x = a as Record<string, unknown>;
      writeLine(`${i + 1}. ${x.name ?? "Untitled"}${x.role ? ` — ${x.role}` : ""}`, { f: bold, color: BRAND.ink, indent: 2 });
      if (x.category || x.grades || x.hours_per_week) {
        writeLine(`${x.category ?? ""}${x.grades ? `  ·  Grades ${x.grades}` : ""}${x.hours_per_week ? `  ·  ${x.hours_per_week} hrs/wk` : ""}`, { size: 8, indent: 6 });
      }
      if (x.description) writeLine(String(x.description), { size: 8, indent: 6 });
    });
    heading("Essays");
    const es = inp.essays as Record<string, unknown> | undefined;
    if (es?.common_essay) { writeLine("Personal statement", { f: bold, color: BRAND.ink, indent: 2 }); writeLine(String(es.common_essay), { size: 8, indent: 4 }); }
    if (es?.why_us) { writeLine("Why this university / major", { f: bold, color: BRAND.ink, indent: 2 }); writeLine(String(es.why_us), { size: 8, indent: 4 }); }
    if (es?.additional_info) { writeLine("Additional info", { f: bold, color: BRAND.ink, indent: 2 }); writeLine(String(es.additional_info), { size: 8, indent: 4 }); }
    heading(`Recommenders (${inp.recommendations?.length ?? 0})`);
    (inp.recommendations ?? []).forEach((r, i) => {
      const x = r as Record<string, unknown>;
      writeLine(`${i + 1}. ${x.recommender_name ?? "—"}${x.recommender_role ? ` (${x.recommender_role})` : ""}`, { indent: 2 });
      if (x.recommender_email) writeLine(String(x.recommender_email), { size: 8, indent: 6 });
      if (x.relationship) writeLine(String(x.relationship), { size: 8, indent: 6 });
    });
    heading("Preferences"); dumpObj(inp.preferences);
  }

  // Footer on each page
  doc.getPages().forEach((p, i) => {
    p.drawText(`Uppseekers Common Admission App  ·  Page ${i + 1}`, {
      x: MARGIN, y: 24, size: 8, font: reg, color: BRAND.muted,
    });
    p.drawText(`Confidential — for ${sanitize(input.email)}`, {
      x: PAGE_W - MARGIN - reg.widthOfTextAtSize(`Confidential — for ${sanitize(input.email)}`, 8), y: 24, size: 8, font: reg, color: BRAND.muted,
    });
  });

  return doc.save();
}

function drawCard(page: PDFPage, x: number, y: number, w: number, h: number) {
  page.drawRectangle({ x: x + 1, y: y - 2, width: w, height: h, color: rgb(0.85, 0.85, 0.92), opacity: 0.25 });
  page.drawRectangle({ x, y, width: w, height: h, color: BRAND.card, borderColor: BRAND.border, borderWidth: 1 });
}

function drawRatingPill(page: PDFPage, bold: PDFFont, reg: PDFFont, x: number, y: number, label: string, value: number) {
  const v = Math.max(0, Math.min(10, Math.round(value)));
  page.drawText(label.toUpperCase(), { x, y, size: 7, font: bold, color: BRAND.muted });
  page.drawText(`${v}`, { x, y: y - 18, size: 22, font: bold, color: BRAND.ink });
  page.drawText("/10", { x: x + bold.widthOfTextAtSize(`${v}`, 22) + 3, y: y - 12, size: 8, font: reg, color: BRAND.muted });
}

function drawUniversityRow(page: PDFPage, bold: PDFFont, reg: PDFFont, x: number, y: number, w: number, e: ShortlistEntry) {
  drawCard(page, x, y - 56, w, 56);
  // Name
  page.drawText(sanitize(e.university), { x: x + 16, y: y - 22, size: 12, font: bold, color: BRAND.ink });
  page.drawText(sanitize(e.country), { x: x + 16, y: y - 36, size: 8, font: reg, color: BRAND.muted });
  if (e.cutoffNotes) {
    page.drawText(sanitize(e.cutoffNotes).slice(0, 60), { x: x + 16, y: y - 48, size: 7, font: reg, color: BRAND.muted });
  }

  // Tier pill
  const tier = e.tier;
  const tcolor = tierColor(tier);
  const pillW = reg.widthOfTextAtSize(tier, 8) + 14;
  page.drawRectangle({ x: x + w - 100 - pillW, y: y - 26, width: pillW, height: 14, color: tcolor, opacity: 0.15 });
  page.drawText(tier, { x: x + w - 100 - pillW + 7, y: y - 22, size: 8, font: bold, color: tcolor });

  // Percentage bar
  const barX = x + w - 200;
  const barW = 180;
  const barY = y - 42;
  page.drawText(`${e.match}%`, { x: x + w - 60, y: y - 22, size: 18, font: bold, color: BRAND.ink });
  page.drawText("admission chance", { x: x + w - 100, y: y - 36, size: 6, font: reg, color: BRAND.muted });

  page.drawRectangle({ x: barX, y: barY, width: barW, height: 6, color: BRAND.border });
  page.drawRectangle({ x: barX, y: barY, width: barW * (e.match / 100), height: 6, color: BRAND.primary });
}
