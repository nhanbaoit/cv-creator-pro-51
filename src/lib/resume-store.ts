import { create } from "zustand";
import { Resume, ResumeData, TemplateId, defaultResumeData, uid } from "./resume-types";
import type { RecommendResult, RecommendInput } from "./recommend";
import { CV_SAMPLES } from "./cv-samples";
import { getCurrentEmail, getCurrentUser } from "./auth";
import { supabase } from "./supabase";

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
  if (typeof window === "undefined") {
    return { resumes: [], activeId: null };
  }

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
  if (typeof window === "undefined") return;
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
    fullName: user?.name || cloned.personal?.fullName || "",
    email: user?.email || cloned.personal?.email || "",
  };

  return cloned as ResumeData;
}

interface ResumeStore {
  hydrated: boolean;
  resumes: Resume[];
  activeId: string | null;

  recommendation: RecommendResult | null;
  setRecommendation: (r: RecommendResult | null) => void;
  clearRecommendation: () => void;

  hydrateForCurrentEmail: () => Promise<void>;
  resetMemory: () => void;

  setActive: (id: string) => void;
  createResume: (title?: string) => string;
  remixSample: (sampleId: string) => string | null;
  duplicateResume: (id: string) => string | undefined;
  deleteResume: (id: string) => void;
  renameResume: (id: string, title: string) => void;
  updateResumeData: (
    id: string,
    updater: (prev: ResumeData) => ResumeData,
  ) => void;
  setTemplate: (id: string, template: TemplateId) => void;
  importJSON: (json: string) => boolean;
  clearMyResumes: () => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  hydrated: false,
  resumes: [],
  activeId: null,

  recommendation: (() => {
    if (typeof window === "undefined") return null;
    return safeParse<RecommendResult | null>(
      localStorage.getItem(RECO_KEY),
      null,
    );
  })(),

  setRecommendation: (r) => {
    set({ recommendation: r });
    if (typeof window !== "undefined") {
      if (r) {
        localStorage.setItem(RECO_KEY, JSON.stringify(r));
      } else {
        localStorage.removeItem(RECO_KEY);
      }
    }
  },

  clearRecommendation: () => {
    set({ recommendation: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem(RECO_KEY);
    }
  },

  hydrateForCurrentEmail: async () => {
    const email = getCurrentEmail();

    if (!email) {
      set({
        hydrated: true,
        resumes: [],
        activeId: null,
      });
      return;
    }

    // 1. Tải nhanh từ LocalStorage trước
    const localData = loadForEmail(email);
    set({
      hydrated: true,
      resumes: localData.resumes,
      activeId: localData.activeId,
    });

    // 2. Đồng bộ ngầm từ Supabase Database nếu có mạng
    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_email", email.trim().toLowerCase())
        .order("updated_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const cloudResumes: Resume[] = data.map((row) => ({
          id: row.id,
          title: row.title,
          template: row.template_id as TemplateId,
          updatedAt: Number(row.updated_at),
          data: row.data as ResumeData,
        }));

        set({
          resumes: cloudResumes,
          activeId: cloudResumes[0]?.id ?? null,
        });

        saveForEmail(email, {
          resumes: cloudResumes,
          activeId: cloudResumes[0]?.id ?? null,
        });
      }
    } catch (e) {
      console.warn("Supabase load failed, fallback to local:", e);
    }
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
    syncToSupabase(r);

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
    syncToSupabase(r);

    return r.id;
  },

  duplicateResume: (id) => {
    const r = get().resumes.find((x) => x.id === id);

    if (!r) return;

    const copy: Resume = {
      id: uid(),
      title: `${r.title} (Copy)`,
      template: r.template,
      updatedAt: Date.now(),
      data: cloneResumeData(r.data),
    };

    set((s) => ({
      resumes: [copy, ...s.resumes],
      activeId: copy.id,
    }));

    persist();
    syncToSupabase(copy);

    return copy.id;
  },

  deleteResume: (id) => {
    set((s) => {
      const next = s.resumes.filter((r) => r.id !== id);
      const nextActive =
        s.activeId === id ? (next[0]?.id ?? null) : s.activeId;

      return {
        resumes: next,
        activeId: nextActive,
      };
    });

    persist();
    deleteFromSupabase(id);
  },

  renameResume: (id, title) => {
    set((s) => ({
      resumes: s.resumes.map((r) =>
        r.id === id ? { ...r, title, updatedAt: Date.now() } : r,
      ),
    }));

    persist();
    const updated = get().resumes.find((r) => r.id === id);
    if (updated) syncToSupabase(updated);
  },

  updateResumeData: (id, updater) => {
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
    const updated = get().resumes.find((r) => r.id === id);
    if (updated) syncToSupabase(updated);
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
    const updated = get().resumes.find((r) => r.id === id);
    if (updated) syncToSupabase(updated);
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
        syncToSupabase(r);

        return true;
      }
    } catch {
      return false;
    }

    return false;
  },

  clearMyResumes: () => {
    const list = get().resumes;
    set({
      resumes: [],
      activeId: null,
    });

    persist();
    list.forEach((r) => deleteFromSupabase(r.id));
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

async function syncToSupabase(resume: Resume) {
  const email = getCurrentEmail();
  if (!email) return;

  try {
    await supabase.from("resumes").upsert(
      {
        id: resume.id,
        user_email: email.trim().toLowerCase(),
        title: resume.title,
        template_id: resume.template,
        data: resume.data,
        created_at: resume.updatedAt,
        updated_at: resume.updatedAt,
      },
      { onConflict: "id" },
    );
  } catch (err) {
    console.error("Failed to sync resume to Supabase:", err);
  }
}

async function deleteFromSupabase(id: string) {
  try {
    await supabase.from("resumes").delete().eq("id", id);
  } catch (err) {
    console.error("Failed to delete resume from Supabase:", err);
  }
}

export const useActiveResume = () => {
  const { resumes, activeId } = useResumeStore();

  return resumes.find((r) => r.id === activeId) ?? resumes[0] ?? null;
};
