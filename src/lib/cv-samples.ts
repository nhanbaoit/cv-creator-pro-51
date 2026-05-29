import { ResumeData, TemplateId, defaultResumeData, uid } from "./resume-types";

export interface CvSample {
  id: string;
  title: string;
  description: string;
  template: TemplateId;
  tags: string[];
  build: () => ResumeData;
}

const base = (): ResumeData => JSON.parse(JSON.stringify(defaultResumeData));

export const CV_SAMPLES: CvSample[] = [
  {
    id: "frontend-intern-starter",
    title: "Frontend Intern Starter CV",
    description:
      "Project-driven CV emphasizing React, JavaScript, and UI work — ideal for first frontend internships.",
    template: "modern",
    tags: ["Frontend", "Projects", "Modern"],
    build: () => {
      const d = base();
      d.personal.title = "Frontend Developer Intern";
      return d;
    },
  },
  {
    id: "php-laravel-intern",
    title: "PHP Laravel Intern CV",
    description: "Backend-focused CV highlighting PHP, Laravel, MySQL, and CRUD systems.",
    template: "modern",
    tags: ["Backend", "PHP", "Laravel"],
    build: () => {
      const d = base();
      d.personal.title = "PHP Developer Intern";
      d.summary =
        "IT student focused on backend web development with PHP and Laravel, experienced building admin dashboards, REST APIs, and MySQL-backed systems.";
      return d;
    },
  },
  {
    id: "software-tester-intern",
    title: "Software Tester Intern CV",
    description:
      "Keyword-friendly CV for QA / tester roles, optimized for ATS keyword scanning.",
    template: "minimal",
    tags: ["Tester", "ATS", "Minimal"],
    build: () => {
      const d = base();
      d.personal.title = "Software Tester Intern";
      d.summary =
        "IT student with hands-on practice in manual testing, writing test cases, and reporting bugs across web applications.";
      return d;
    },
  },
  {
    id: "uiux-portfolio",
    title: "UI/UX Portfolio CV",
    description:
      "Visual portfolio-style CV for UI/UX designer applications, with sidebar avatar layout.",
    template: "creative",
    tags: ["UI/UX", "Portfolio", "Creative"],
    build: () => {
      const d = base();
      d.personal.title = "UI/UX Designer Intern";
      d.summary =
        "IT student passionate about user-centered design, with experience prototyping in Figma and turning research into accessible interfaces.";
      return d;
    },
  },
  {
    id: "no-experience-student",
    title: "No Experience Student CV",
    description:
      "Clean, traditional Harvard layout that puts education and skills first — great when you have no experience yet.",
    template: "harvard",
    tags: ["Student", "No experience", "Professional"],
    build: () => {
      const d = base();
      d.personal.title = "IT Student";
      d.projects = d.projects.slice(0, 2);
      d.experience = [];
      return d;
    },
  },
];
