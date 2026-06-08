export type TemplateId = "harvard" | "modern" | "minimal" | "creative";

export interface Personal {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio: string;
  avatar?: string;
}

export interface Education {
  id: string;
  school: string;
  major: string;
  startYear: string;
  endYear: string;
  description: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  techStack: string;
  description: string;
  github: string;
  demo: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export interface ResumeData {
  personal: Personal;
  summary: string;
  education: Education[];
  skills: SkillGroup[];
  projects: Project[];
  experience: Experience[];
  certificates: Certificate[];
  languages: Language[];
  links: LinkItem[];
}

export interface Resume {
  id: string;
  title: string;
  template: TemplateId;
  updatedAt: number;
  data: ResumeData;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const defaultResumeData: ResumeData = {
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    portfolio: "",
    avatar: "",
  },
  summary:
    "IT student with a strong interest in software development, experienced in building web applications and working with modern development tools.",
  education: [
    {
      id: uid(),
      school: "",
      major: "Information Technology",
      startYear: "",
      endYear: "",
      description:
        "Relevant coursework: Frontend Web, Programming, Database, Data Structures, Software Testing.",
    },
  ],
  skills: [
    {
      id: uid(),
      category: "Frontend",
      items: "HTML, CSS, JavaScript, React, Tailwind CSS",
    },
    {
      id: uid(),
      category: "Backend",
      items: "PHP, Laravel, MySQL",
    },
    {
      id: uid(),
      category: "Tools",
      items: "Git, GitHub, Figma, VS Code",
    },
    {
      id: uid(),
      category: "Testing",
      items: "Manual Testing, Test Case, Bug Report",
    },
  ],
  projects: [
    {
      id: uid(),
      name: "Personal Portfolio Website",
      role: "Frontend Developer",
      techStack: "React, Vite, Tailwind CSS",
      description:
        "Built a responsive personal portfolio website to showcase projects and skills.\nImplemented reusable React components and smooth UI animations.",
      github: "",
      demo: "",
    },
    {
      id: uid(),
      name: "E-commerce Admin Dashboard",
      role: "Fullstack Developer",
      techStack: "PHP, Laravel, MySQL, Bootstrap",
      description:
        "Developed product, user, and order management features.\nImplemented search, filter, and export invoice functionality.",
      github: "",
      demo: "",
    },
    {
      id: uid(),
      name: "Student Management System",
      role: "Developer",
      techStack: "Java, MySQL",
      description:
        "Built CRUD features for student management.\nApplied object-oriented programming and database connection.",
      github: "",
      demo: "",
    },
  ],
  experience: [],
  certificates: [
    {
      id: uid(),
      name: "Certificate Name",
      issuer: "Issuer",
      date: "",
    },
  ],
  languages: [
    {
      id: uid(),
      name: "English",
      level: "Intermediate",
    },
  ],
  links: [],
};

export const createBlankResumeData = (user?: { name?: string; email?: string }): ResumeData => ({
  ...JSON.parse(JSON.stringify(defaultResumeData)),
  personal: {
    fullName: user?.name ?? "",
    title: "",
    email: user?.email ?? "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    portfolio: "",
    avatar: "",
  },
});

export const sampleResumes = (): Resume[] => [
  {
    id: uid(),
    title: "Frontend Intern CV",
    template: "modern",
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    data: {
      ...JSON.parse(JSON.stringify(defaultResumeData)),
      personal: {
        ...defaultResumeData.personal,
        title: "Frontend Developer Intern",
      },
    },
  },
  {
    id: uid(),
    title: "PHP Developer Intern CV",
    template: "harvard",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    data: {
      ...JSON.parse(JSON.stringify(defaultResumeData)),
      personal: {
        ...defaultResumeData.personal,
        title: "PHP Developer Intern",
      },
    },
  },
  {
    id: uid(),
    title: "Software Tester Intern CV",
    template: "minimal",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    data: {
      ...JSON.parse(JSON.stringify(defaultResumeData)),
      personal: {
        ...defaultResumeData.personal,
        title: "Software Tester Intern",
      },
    },
  },
];
