export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

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

export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  org_name: string;
}): Promise<AuthUser> {
  const res = await authFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Registration failed");
  }
  return res.json();
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
  return res.json();
}

export async function signOut(): Promise<void> {
  await authFetch("/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<AuthUser | null> {
  const res = await authFetch("/auth/me");
  if (!res.ok) return null;
  return res.json();
}
