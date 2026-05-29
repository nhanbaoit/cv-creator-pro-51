import { create } from "zustand";
import {
  Resume,
  ResumeData,
  TemplateId,
  defaultResumeData,
  sampleResumes,
  uid,
} from "./resume-types";
import type { RecommendResult, RecommendInput } from "./recommend";
import { CV_SAMPLES } from "./cv-samples";
import { getCurrentEmail } from "./auth";

const RECO_KEY = "devresume_recommendation";

interface PersistedShape {
  resumes: Resume[];
  activeId: string | null;
}

function resumesKey(email: string) {
  return `devresume_resumes_${email}`;
}

function loadForEmail(email: string): PersistedShape {
  try {
    const raw = localStorage.getItem(resumesKey(email));
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedShape;
      if (parsed && Array.isArray(parsed.resumes)) return parsed;
    }
  } catch {}
  const seed = sampleResumes();
  return { resumes: seed, activeId: seed[0]?.id ?? null };
}

function saveForEmail(email: string, state: PersistedShape) {
  localStorage.setItem(resumesKey(email), JSON.stringify(state));
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
      if (r) localStorage.setItem(RECO_KEY, JSON.stringify(r));
      else localStorage.removeItem(RECO_KEY);
    }
  },

  loadForCurrentUser: () => {
    const email = getCurrentEmail();
    if (!email) {
      set({ hydrated: true, resumes: [], activeId: null });
      return;
    }
    const data = loadForEmail(email);
    set({ hydrated: true, ...data });
  },

  resetMemory: () => set({ hydrated: false, resumes: [], activeId: null }),

  setActive: (id) => {
    set({ activeId: id });
    persist();
  },

  createResume: (title = "Untitled CV") => {
    const r: Resume = {
      id: uid(),
      title,
      template: "modern",
      updatedAt: Date.now(),
      data: defaultResumeData,
    };
    set((s) => ({ resumes: [r, ...s.resumes], activeId: r.id }));
    persist();
    return r.id;
  },

  remixSample: (sampleId) => {
    const sample = CV_SAMPLES.find((s) => s.id === sampleId);
    if (!sample) return null;
    const r: Resume = {
      id: uid(),
      title: `${sample.title} (Remix)`,
      template: sample.template,
      updatedAt: Date.now(),
      data: sample.build(),
    };
    set((s) => ({ resumes: [r, ...s.resumes], activeId: r.id }));
    persist();
    return r.id;
  },

  duplicateResume: (id) => {
    const r = get().resumes.find((x) => x.id === id);
    if (!r) return;
    const copy: Resume = { ...r, id: uid(), title: r.title + " (Copy)", updatedAt: Date.now() };
    set((s) => ({ resumes: [copy, ...s.resumes] }));
    persist();
  },

  deleteResume: (id) => {
    set((s) => {
      const resumes = s.resumes.filter((r) => r.id !== id);
      return {
        resumes,
        activeId: s.activeId === id ? resumes[0]?.id ?? null : s.activeId,
      };
    });
    persist();
  },

  updateResume: (id, patch) => {
    set((s) => ({
      resumes: s.resumes.map((r) =>
        r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r
      ),
    }));
    persist();
  },

  updateData: (id, updater) => {
    set((s) => ({
      resumes: s.resumes.map((r) =>
        r.id === id ? { ...r, data: updater(r.data), updatedAt: Date.now() } : r
      ),
    }));
    persist();
  },

  setTemplate: (id, template) => {
    set((s) => ({
      resumes: s.resumes.map((r) =>
        r.id === id ? { ...r, template, updatedAt: Date.now() } : r
      ),
    }));
    persist();
  },

  importJSON: (json) => {
    try {
      const parsed = JSON.parse(json);
      if (parsed && parsed.data && parsed.title) {
        const r: Resume = { ...parsed, id: uid(), updatedAt: Date.now() };
        set((s) => ({ resumes: [r, ...s.resumes], activeId: r.id }));
        persist();
        return true;
      }
    } catch {}
    return false;
  },

  clearMyResumes: () => {
    set({ resumes: [], activeId: null });
    persist();
  },
}));

function persist() {
  const email = getCurrentEmail();
  if (!email) return;
  const { resumes, activeId } = useResumeStore.getState();
  saveForEmail(email, { resumes, activeId });
}

export const useActiveResume = () => {
  const { resumes, activeId } = useResumeStore();
  return resumes.find((r) => r.id === activeId) ?? resumes[0] ?? null;
};
