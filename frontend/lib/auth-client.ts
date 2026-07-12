import { API_BASE } from "@/lib/api";

export interface AuthUser {
  user_id: string;
  email: string;
  name: string | null;
  org_id: string;
  org_name: string;
  role: string;
}

async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

async function setFrontendSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "POST" });
}

async function clearFrontendSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}

export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  org_name: string;
}): Promise<AuthUser> {
  const res = await authFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err.detail;
    throw new Error(
      typeof detail === "string" ? detail : Array.isArray(detail) ? detail[0]?.msg : "Registration failed"
    );
  }
  const user = await res.json();
  await setFrontendSession();
  return user;
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const res = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Invalid email or password");
  }
  const user = await res.json();
  await setFrontendSession();
  return user;
}

export async function signOut(): Promise<void> {
  await Promise.all([
    authFetch("/auth/logout", { method: "POST" }),
    clearFrontendSession(),
  ]);
}

export async function getMe(): Promise<AuthUser | null> {
  const res = await authFetch("/auth/me");
  if (!res.ok) return null;
  return res.json();
}
