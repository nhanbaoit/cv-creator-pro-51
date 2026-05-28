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

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  return safeParse<User[]>(localStorage.getItem(USERS_KEY), []);
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  return safeParse<User | null>(localStorage.getItem(CURRENT_KEY), null);
}

export function getCurrentEmail(): string | null {
  return getCurrentUser()?.email ?? null;
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
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim()) return { ok: false, error: "Full name is required" };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Invalid email" };
  if (input.password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters" };

  const users = getUsers();
  if (users.some((u) => u.email === email))
    return { ok: false, error: "Email already registered" };

  const user: User = {
    name: input.name.trim(),
    email,
    password: input.password,
    createdAt: Date.now(),
  };
  saveUsers([...users, user]);
  return { ok: true, user };
}

export function loginUser(
  email: string,
  password: string
): { ok: true; user: User } | { ok: false; error: string } {
  const e = email.trim().toLowerCase();
  const user = getUsers().find((u) => u.email === e);
  if (!user) return { ok: false, error: "Account not found" };
  if (user.password !== password) return { ok: false, error: "Incorrect password" };
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  return { ok: true, user };
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_KEY);
}

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  refresh: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  refresh: () => set({ user: getCurrentUser() }),
}));
