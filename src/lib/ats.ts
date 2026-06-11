import { ResumeData } from "./resume-types";

export interface AtsResult {
  score: number;
  breakdown: { label: string; points: number; max: number; ok: boolean }[];
  quality: number;
}

export function computeAts(data: ResumeData): AtsResult {
  const b: AtsResult["breakdown"] = [];
  const add = (label: string, ok: boolean, points: number, max: number) =>
    b.push({ label, points: ok ? points : 0, max, ok });

  const p = data.personal;
  add("Họ tên, email, SĐT", !!(p.fullName && p.email && p.phone), 10, 10);
  add("GitHub / LinkedIn / Portfolio", !!(p.github || p.linkedin || p.portfolio), 10, 10);
  add("Tóm tắt bản thân", data.summary.trim().length > 30, 10, 10);

  const skillCount = data.skills.reduce(
    (n, s) =>
      n +
      s.items
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean).length,
    0,
  );
  add("Ít nhất 6 kỹ năng kỹ thuật", skillCount >= 6, 15, 15);

  add("Ít nhất 2 dự án", data.projects.length >= 2, 20, 20);
  add(
    "Mỗi dự án có tech stack",
    data.projects.length > 0 && data.projects.every((pr) => pr.techStack.trim().length > 0),
    10,
    10,
  );
  add(
    "Mỗi dự án có mô tả bullet",
    data.projects.length > 0 &&
      data.projects.every((pr) => pr.description.split("\n").filter((l) => l.trim()).length >= 1),
    10,
    10,
  );
  add("Có học vấn", data.education.length > 0, 10, 10);
  add("Có chứng chỉ", data.certificates.length > 0, 5, 5);

  const score = b.reduce((sum, x) => sum + x.points, 0);
  const quality = Math.min(100, Math.round(score * 0.95 + (data.summary.length > 80 ? 5 : 0)));
  return { score, breakdown: b, quality };
}

export function resumeToText(data: ResumeData): string {
  const parts: string[] = [];
  parts.push(Object.values(data.personal).join(" "));
  parts.push(data.summary);
  data.skills.forEach((s) => parts.push(s.category + " " + s.items));
  data.projects.forEach((p) => parts.push([p.name, p.role, p.techStack, p.description].join(" ")));
  data.experience.forEach((e) => parts.push([e.company, e.position, e.description].join(" ")));
  data.education.forEach((e) => parts.push([e.school, e.major, e.description].join(" ")));
  data.certificates.forEach((c) => parts.push(c.name + " " + c.issuer));
  return parts.join(" ").toLowerCase();
}

export function matchJobKeywords(data: ResumeData, jd: string) {
  const stop = new Set([
    "and",
    "or",
    "the",
    "a",
    "an",
    "for",
    "of",
    "to",
    "in",
    "on",
    "with",
    "is",
    "are",
    "be",
    "you",
    "we",
    "our",
    "as",
    "at",
    "by",
    "this",
    "that",
    "will",
    "have",
    "has",
    "from",
    "using",
    "use",
    "ability",
    "strong",
  ]);
  const keywords = Array.from(
    new Set(
      jd
        .toLowerCase()
        .replace(/[^a-z0-9+#.\-\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stop.has(w)),
    ),
  );
  const cv = resumeToText(data);
  const matched = keywords.filter((k) => cv.includes(k));
  const missing = keywords.filter((k) => !cv.includes(k));
  const pct = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;
  return { matched, missing, pct };
}
