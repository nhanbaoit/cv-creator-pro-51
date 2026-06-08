import { ResumeData, TemplateId, defaultResumeData } from "./resume-types";

export interface CvSample {
  id: string;
  title: string;
  description: string;
  template: TemplateId;
  tags: string[];
  build: () => ResumeData;
}

function cloneDefault(): ResumeData {
  return JSON.parse(JSON.stringify(defaultResumeData)) as ResumeData;
}

function removePersonalInfo(data: ResumeData): ResumeData {
  return {
    ...data,
    personal: {
      ...data.personal,
      fullName: "Your Name",
      email: "your.email@example.com",
      phone: "",
      location: "",
      github: "",
      linkedin: "",
      portfolio: "",
      avatar: "",
    },
  };
}

const base = (): ResumeData => {
  const data = cloneDefault();
  return removePersonalInfo(data);
};

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
      d.summary =
        "IT student with a strong interest in frontend development, experienced in building responsive web interfaces using HTML, CSS, JavaScript, React, and Tailwind CSS.";

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
        "IT student focused on backend web development with PHP and Laravel, experienced in building admin dashboards, CRUD features, and MySQL-backed systems.";

      return d;
    },
  },
  {
    id: "software-tester-intern",
    title: "Software Tester Intern CV",
    description: "Keyword-friendly CV for QA / tester roles, optimized for ATS keyword scanning.",
    template: "minimal",
    tags: ["Tester", "ATS", "Minimal"],
    build: () => {
      const d = base();

      d.personal.title = "Software Tester Intern";
      d.summary =
        "IT student with hands-on practice in manual testing, writing test cases, reporting bugs, and testing web applications.";

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
        "IT student passionate about user-centered design, with experience prototyping in Figma and turning ideas into accessible user interfaces.";

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
      d.summary =
        "Information Technology student seeking an internship opportunity to apply programming knowledge, improve practical skills, and gain real-world software development experience.";

      d.projects = d.projects.slice(0, 2);
      d.experience = [];

      return d;
    },
  },
];
