import { create } from "zustand";
import { Resume, ResumeData, TemplateId, defaultResumeData, uid } from "./resume-types";
import type { RecommendResult, RecommendInput } from "./recommend";
import { CV_SAMPLES } from "./cv-samples";
import { getCurrentEmail, getCurrentUser } from "./auth";

const RECO_KEY = "devresume_recommendation";

interface PersistedShape {
  resumes: Resume[];
  activeId: string | null;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function cloneResumeData(data: ResumeData): ResumeData {
  if (typeof structuredClone !== "undefined") {
    return structuredClone(data);
  }

  return JSON.parse(JSON.stringify(data)) as ResumeData;
}

function resumesKey(email: string) {
  return `devresume_resumes_${email.trim().toLowerCase()}`;
}

function loadForEmail(email: string): PersistedShape {
  const raw = localStorage.getItem(resumesKey(email));

  if (!raw) {
    return {
      resumes: [],
      activeId: null,
    };
  }

  const parsed = safeParse<PersistedShape>(raw, {
    resumes: [],
    activeId: null,
  });

  if (!Array.isArray(parsed.resumes)) {
    return {
      resumes: [],
      activeId: null,
    };
  }

  const activeExists = parsed.resumes.some((r) => r.id === parsed.activeId);

  return {
    resumes: parsed.resumes,
    activeId: activeExists ? parsed.activeId : (parsed.resumes[0]?.id ?? null),
  };
}

function saveForEmail(email: string, state: PersistedShape) {
  localStorage.setItem(resumesKey(email), JSON.stringify(state));
}

function createEmptyResumeData(): ResumeData {
  const user = getCurrentUser();
  const data = cloneResumeData(defaultResumeData) as any;

  data.personal = {
    ...(data.personal ?? {}),
    fullName: user?.name ?? "",
    title: "",
    email: user?.email ?? "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    portfolio: "",
    avatar: "",
  };

  data.summary = "";
  data.education = [];
  data.skills = [];
  data.projects = [];
  data.experience = [];
  data.certificates = [];
  data.languages = [];

  return data as ResumeData;
}
function sanitizeSampleForCurrentUser(data: ResumeData): ResumeData {
  const user = getCurrentUser();
  const cloned = cloneResumeData(data) as any;

  cloned.personal = {
    ...(cloned.personal ?? {}),
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    portfolio: "",
    avatar: "",
  };

  return cloned as ResumeData;
}

interface ResumeStore {
  hydrated: boolean;
  resumes: Resume[];
  activeId: string | null;
  lastRecommendation: (RecommendResult & { input: RecommendInput }) | null;

  setRecommendation: (r: (RecommendResult & { input: RecommendInput }) | null) => void;

  loadForCurrentUser: () => void;
  resetMemory: () => void;
  setActive: (id: string) => void;
  createResume: (title?: string) => string;
  remixSample: (sampleId: string) => string | null;
  duplicateResume: (id: string) => void;
  deleteResume: (id: string) => void;
  updateResume: (id: string, patch: Partial<Resume>) => void;
  updateData: (id: string, updater: (d: ResumeData) => ResumeData) => void;
  setTemplate: (id: string, template: TemplateId) => void;
  importJSON: (json: string) => boolean;
  clearMyResumes: () => void;
}

export const useResumeStore = create<ResumeStore>()((set, get) => ({
  hydrated: false,
  resumes: [],
  activeId: null,

  lastRecommendation:
    typeof window !== "undefined"
      ? (() => {
          try {
            const raw = localStorage.getItem(RECO_KEY);
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })()
      : null,

  setRecommendation: (r) => {
    set({ lastRecommendation: r });

    if (typeof window !== "undefined") {
      if (r) {
        localStorage.setItem(RECO_KEY, JSON.stringify(r));
      } else {
        localStorage.removeItem(RECO_KEY);
      }
    }
  },

  loadForCurrentUser: () => {
    const email = getCurrentEmail();

    if (!email) {
      set({
        hydrated: true,
        resumes: [],
        activeId: null,
      });
      return;
    }

    const data = loadForEmail(email);

    set({
      hydrated: true,
      resumes: data.resumes,
      activeId: data.activeId,
    });
  },

  resetMemory: () =>
    set({
      hydrated: false,
      resumes: [],
      activeId: null,
    }),

  setActive: (id) => {
    const exists = get().resumes.some((r) => r.id === id);

    if (!exists) return;

    set({ activeId: id });
    persist();
  },

  createResume: (title = "Untitled CV") => {
    const r: Resume = {
      id: uid(),
      title,
      template: "modern",
      updatedAt: Date.now(),
      data: createEmptyResumeData(),
    };

    set((s) => ({
      resumes: [r, ...s.resumes],
      activeId: r.id,
    }));

    persist();

    return r.id;
  },

  remixSample: (sampleId) => {
    const sample = CV_SAMPLES.find((s) => s.id === sampleId);

    if (!sample) return null;

    const sampleData = sample.build();
    const safeData = sanitizeSampleForCurrentUser(sampleData);

    const r: Resume = {
      id: uid(),
      title: `${sample.title} (Remix)`,
      template: sample.template,
      updatedAt: Date.now(),
      data: safeData,
    };

    set((s) => ({
      resumes: [r, ...s.resumes],
      activeId: r.id,
    }));

    persist();

    return r.id;
  },

  duplicateResume: (id) => {
    const r = get().resumes.find((x) => x.id === id);

    if (!r) return;

    const copy: Resume = {
      ...r,
      id: uid(),
      title: `${r.title} (Copy)`,
      updatedAt: Date.now(),
      data: cloneResumeData(r.data),
    };

    set((s) => ({
      resumes: [copy, ...s.resumes],
      activeId: copy.id,
    }));

    persist();
  },

  deleteResume: (id) => {
    set((s) => {
      const resumes = s.resumes.filter((r) => r.id !== id);

      return {
        resumes,
        activeId: s.activeId === id ? (resumes[0]?.id ?? null) : s.activeId,
      };
    });

    persist();
  },

  updateResume: (id, patch) => {
    set((s) => ({
      resumes: s.resumes.map((r) =>
        r.id === id
          ? {
              ...r,
              ...patch,
              updatedAt: Date.now(),
            }
          : r,
      ),
    }));

    persist();
  },

  updateData: (id, updater) => {
    set((s) => ({
      resumes: s.resumes.map((r) =>
        r.id === id
          ? {
              ...r,
              data: updater(r.data),
              updatedAt: Date.now(),
            }
          : r,
      ),
    }));

    persist();
  },

  setTemplate: (id, template) => {
    set((s) => ({
      resumes: s.resumes.map((r) =>
        r.id === id
          ? {
              ...r,
              template,
              updatedAt: Date.now(),
            }
          : r,
      ),
    }));

    persist();
  },

  importJSON: (json) => {
    try {
      const parsed = JSON.parse(json);

      if (parsed && parsed.data && parsed.title) {
        const r: Resume = {
          ...parsed,
          id: uid(),
          updatedAt: Date.now(),
        };

        set((s) => ({
          resumes: [r, ...s.resumes],
          activeId: r.id,
        }));

        persist();

        return true;
      }
    } catch {
      return false;
    }

    return false;
  },

  clearMyResumes: () => {
    set({
      resumes: [],
      activeId: null,
    });

    persist();
  },
}));

function persist() {
  const email = getCurrentEmail();

  if (!email) return;

  const { resumes, activeId } = useResumeStore.getState();

  saveForEmail(email, {
    resumes,
    activeId,
  });
}

export const useActiveResume = () => {
  const { resumes, activeId } = useResumeStore();

  return resumes.find((r) => r.id === activeId) ?? resumes[0] ?? null;
};
