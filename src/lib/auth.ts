import { create } from "zustand";

export interface User {
  name: string;
  email: string;
  password: string; // plain text — frontend simulation only
  createdAt: number;
}

const USERS_KEY = "devresume_users";
const CURRENT_KEY = "devresume_current_user";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  return safeParse<User[]>(localStorage.getItem(USERS_KEY), []);
}

function saveUsers(users: User[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  return safeParse<User | null>(localStorage.getItem(CURRENT_KEY), null);
}

export function getCurrentEmail(): string | null {
  return getCurrentUser()?.email ?? null;
}

/**
 * Resume storage key for each user.
 * Example:
 * devresume_resumes_demo@gmail.com
 * devresume_resumes_nhanbao@gmail.com
 */
export function getUserResumeStorageKey(email: string) {
  return `devresume_resumes_${normalizeEmail(email)}`;
}

/**
 * Active resume id storage key for each user.
 * Example:
 * devresume_active_resume_demo@gmail.com
 */
export function getUserActiveResumeKey(email: string) {
  return `devresume_active_resume_${normalizeEmail(email)}`;
}

/**
 * Use this when no user is logged in.
 * Usually only used as a fallback.
 */
export function getGuestResumeStorageKey() {
  return "devresume_resumes_guest";
}

export function getGuestActiveResumeKey() {
  return "devresume_active_resume_guest";
}

/**
 * Get storage keys based on current logged-in user.
 */
export function getCurrentUserStorageKeys() {
  const user = getCurrentUser();

  if (!user) {
    return {
      resumeKey: getGuestResumeStorageKey(),
      activeKey: getGuestActiveResumeKey(),
    };
  }

  return {
    resumeKey: getUserResumeStorageKey(user.email),
    activeKey: getUserActiveResumeKey(user.email),
  };
}

export function seedDemoUserIfEmpty() {
  if (typeof window === "undefined") return;

  const users = getUsers();

  if (users.length === 0) {
    saveUsers([
      {
        name: "Demo User",
        email: "demo@gmail.com",
        password: "123456",
        createdAt: Date.now(),
      },
    ]);
  }
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): { ok: true; user: User } | { ok: false; error: string } {
  const email = normalizeEmail(input.email);

  if (!input.name.trim()) {
    return { ok: false, error: "Full name is required" };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Invalid email" };
  }

  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }

  const users = getUsers();

  if (users.some((u) => u.email === email)) {
    return { ok: false, error: "Email already registered" };
  }

  const user: User = {
    name: input.name.trim(),
    email,
    password: input.password,
    createdAt: Date.now(),
  };

  saveUsers([...users, user]);

  /**
   * Important:
   * Do not create resumes here using old user data.
   * A new user should start with an empty resume list.
   */
  if (typeof window !== "undefined") {
    localStorage.setItem(getUserResumeStorageKey(email), JSON.stringify([]));
    localStorage.removeItem(getUserActiveResumeKey(email));
  }

  return { ok: true, user };
}

export function loginUser(
  email: string,
  password: string,
): { ok: true; user: User } | { ok: false; error: string } {
  const e = normalizeEmail(email);

  const user = getUsers().find((u) => u.email === e);

  if (!user) {
    return { ok: false, error: "Account not found" };
  }

  if (user.password !== password) {
    return { ok: false, error: "Incorrect password" };
  }

  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));

  /**
   * Ensure this user has isolated storage keys.
   * Do not copy data from another user.
   */
  const resumeKey = getUserResumeStorageKey(user.email);

  if (!localStorage.getItem(resumeKey)) {
    localStorage.setItem(resumeKey, JSON.stringify([]));
  }

  return { ok: true, user };
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_KEY);
}

export function clearCurrentUserResumeData() {
  const user = getCurrentUser();

  if (!user) return;

  localStorage.removeItem(getUserResumeStorageKey(user.email));
  localStorage.removeItem(getUserActiveResumeKey(user.email));
}

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  refresh: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getCurrentUser(),
  setUser: (user) => set({ user }),
  refresh: () => set({ user: getCurrentUser() }),
}));
