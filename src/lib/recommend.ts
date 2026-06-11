import { TemplateId } from "./resume-types";

export type TargetRole = "frontend" | "backend" | "php" | "uiux" | "tester" | "data";

export type ExperienceLevel = "none" | "projects" | "internship";

export type ResumeStyle = "professional" | "minimal" | "creative" | "ats";

export interface RecommendInput {
  role: TargetRole;
  experience: ExperienceLevel;
  style: ResumeStyle;
}

export interface RecommendResult {
  template: TemplateId;
  match: number;
  reason: string;
}

export const ROLE_OPTIONS: { value: TargetRole; label: string }[] = [
  { value: "frontend", label: "Frontend Developer Intern" },
  { value: "backend", label: "Backend Developer Intern" },
  { value: "php", label: "PHP Developer Intern" },
  { value: "uiux", label: "UI/UX Designer Intern" },
  { value: "tester", label: "Software Tester Intern" },
  { value: "data", label: "Data Analyst Intern" },
];

export const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "none", label: "No experience" },
  { value: "projects", label: "Personal projects" },
  { value: "internship", label: "Internship experience" },
];

export const STYLE_OPTIONS: { value: ResumeStyle; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "minimal", label: "Minimal" },
  { value: "creative", label: "Creative" },
  { value: "ats", label: "ATS-friendly" },
];

export interface TemplateMeta {
  name: string;
  tags: string[];
  description: string;
  supportsAvatar: boolean;
  avatarSize?: "small" | "large";
}

export const TEMPLATE_META: Record<TemplateId, TemplateMeta> = {
  harvard: {
    name: "Harvard Classic",
    tags: ["ATS-friendly", "Professional", "Best for Interns"],
    description: "Clean, traditional, easy to read. Great for formal companies.",
    supportsAvatar: false,
  },
  modern: {
    name: "Modern Developer",
    tags: ["Project-focused", "Best for Interns"],
    description: "Modern, technical, project-focused layout for developers.",
    supportsAvatar: true,
    avatarSize: "small",
  },
  minimal: {
    name: "Minimal ATS",
    tags: ["ATS-friendly", "Minimal"],
    description: "Simple one-column layout optimized for ATS scanning.",
    supportsAvatar: false,
  },
  creative: {
    name: "Creative Portfolio",
    tags: ["Creative", "Project-focused"],
    description: "Visual, modern layout for designers and portfolio applications.",
    supportsAvatar: true,
    avatarSize: "large",
  },
};

export function templateSupportsAvatar(t: TemplateId): boolean {
  return TEMPLATE_META[t].supportsAvatar;
}

const ROLE_LABEL: Record<TargetRole, string> = Object.fromEntries(
  ROLE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<TargetRole, string>;

const EXP_LABEL: Record<ExperienceLevel, string> = Object.fromEntries(
  EXPERIENCE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ExperienceLevel, string>;

const STYLE_LABEL: Record<ResumeStyle, string> = Object.fromEntries(
  STYLE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ResumeStyle, string>;

export function recommendTemplate(input: RecommendInput): RecommendResult {
  const { role, experience, style } = input;
  const scores: Record<TemplateId, number> = {
    harvard: 50,
    modern: 50,
    minimal: 50,
    creative: 50,
  };
  const reasons: string[] = [];

  // Rule: Frontend + Creative style => Creative Portfolio
  if (role === "frontend" && style === "creative") {
    scores.creative += 45;
    reasons.push(
      "you are applying for a Frontend Developer Intern position and prefer a creative style",
    );
  }
  // Rule: Frontend + personal projects => Modern Developer
  else if (role === "frontend" && experience === "projects") {
    scores.modern += 45;
    reasons.push(
      "you are applying for a Frontend Developer Intern position and have personal projects to highlight React, JavaScript, UI skills, and portfolio work",
    );
  }
  // Backend / PHP => Modern Developer
  else if (role === "backend" || role === "php") {
    scores.modern += 40;
    reasons.push(
      `you are applying for a ${ROLE_LABEL[role]} role which benefits from a technical, project-focused layout`,
    );
  }
  // Tester / Data => Minimal ATS
  else if (role === "tester" || role === "data") {
    scores.minimal += 40;
    reasons.push(
      `${ROLE_LABEL[role]} roles are often screened by ATS, so a keyword-friendly layout is ideal`,
    );
  }
  // UI/UX => Creative Portfolio
  else if (role === "uiux") {
    scores.creative += 45;
    reasons.push("UI/UX Designer Intern roles favor a visual, portfolio-driven layout");
  }

  // Style rules
  if (style === "ats") {
    scores.minimal += 30;
    reasons.push("you want an ATS-friendly resume");
  } else if (style === "minimal") {
    scores.minimal += 25;
    reasons.push("you prefer a minimal style");
  } else if (style === "professional") {
    scores.harvard += 30;
    reasons.push("you prefer a professional style");
  } else if (style === "creative") {
    scores.creative += 25;
  }

  // Experience rules
  if (experience === "none") {
    scores.harvard += 20;
    scores.minimal += 15;
    reasons.push(
      "with no prior experience, a clean traditional layout helps focus on education and skills",
    );
  } else if (experience === "projects") {
    scores.modern += 20;
    scores.creative += 10;
  } else if (experience === "internship") {
    scores.harvard += 10;
    scores.modern += 10;
  }

  // Pick winner
  const winner = (Object.entries(scores) as [TemplateId, number][]).sort((a, b) => b[1] - a[1])[0];
  const template = winner[0];
  const match = Math.min(98, Math.max(72, winner[1] + 10));

  const meta = TEMPLATE_META[template];
  const reason = `${meta.name} is recommended because ${reasons.join("; ") || `it matches your selected preferences (${ROLE_LABEL[role]}, ${EXP_LABEL[experience]}, ${STYLE_LABEL[style]})`}.`;

  return { template, match, reason };
}
