import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Resume,
  ResumeData,
  TemplateId,
  defaultResumeData,
  sampleResumes,
  uid,
} from "./resume-types";
import type { RecommendResult, RecommendInput } from "./recommend";

interface ResumeStore {
  resumes: Resume[];
  activeId: string | null;
  lastRecommendation: (RecommendResult & { input: RecommendInput }) | null;
  setRecommendation: (r: (RecommendResult & { input: RecommendInput }) | null) => void;
  setActive: (id: string) => void;
  createResume: (title?: string) => string;
  duplicateResume: (id: string) => void;
  deleteResume: (id: string) => void;
  updateResume: (id: string, patch: Partial<Resume>) => void;
  updateData: (id: string, updater: (d: ResumeData) => ResumeData) => void;
  setTemplate: (id: string, template: TemplateId) => void;
  importJSON: (json: string) => boolean;
  clearAll: () => void;
}

const seed = sampleResumes();

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resumes: seed,
      activeId: seed[0]?.id ?? null,
      setActive: (id) => set({ activeId: id }),
      createResume: (title = "CV mới") => {
        const r: Resume = {
          id: uid(),
          title,
          template: "modern",
          updatedAt: Date.now(),
          data: defaultResumeData,
        };
        set((s) => ({ resumes: [r, ...s.resumes], activeId: r.id }));
        return r.id;
      },
      duplicateResume: (id) => {
        const r = get().resumes.find((x) => x.id === id);
        if (!r) return;
        const copy: Resume = { ...r, id: uid(), title: r.title + " (Bản sao)", updatedAt: Date.now() };
        set((s) => ({ resumes: [copy, ...s.resumes] }));
      },
      deleteResume: (id) =>
        set((s) => {
          const resumes = s.resumes.filter((r) => r.id !== id);
          return {
            resumes,
            activeId: s.activeId === id ? resumes[0]?.id ?? null : s.activeId,
          };
        }),
      updateResume: (id, patch) =>
        set((s) => ({
          resumes: s.resumes.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r
          ),
        })),
      updateData: (id, updater) =>
        set((s) => ({
          resumes: s.resumes.map((r) =>
            r.id === id ? { ...r, data: updater(r.data), updatedAt: Date.now() } : r
          ),
        })),
      setTemplate: (id, template) =>
        set((s) => ({
          resumes: s.resumes.map((r) =>
            r.id === id ? { ...r, template, updatedAt: Date.now() } : r
          ),
        })),
      importJSON: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (parsed && parsed.data && parsed.title) {
            const r: Resume = { ...parsed, id: uid(), updatedAt: Date.now() };
            set((s) => ({ resumes: [r, ...s.resumes], activeId: r.id }));
            return true;
          }
        } catch {}
        return false;
      },
      clearAll: () => set({ resumes: [], activeId: null }),
    }),
    { name: "devresume-store" }
  )
);

export const useActiveResume = () => {
  const { resumes, activeId } = useResumeStore();
  return resumes.find((r) => r.id === activeId) ?? resumes[0] ?? null;
};
