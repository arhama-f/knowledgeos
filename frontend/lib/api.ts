"use client";

import { useCallback } from "react";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    return parsed.detail ?? text;
  } catch {
    return text || `Request failed: ${response.status}`;
  }
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useApi() {
  const request = useCallback(async (path: string, init: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(init.headers);
    if (init.body && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    const opts = { ...init, headers, credentials: "include" as RequestCredentials };
    let response = await fetch(`${API_BASE}${path}`, opts);

    if (response.status === 401) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        response = await fetch(`${API_BASE}${path}`, opts);
      }
      if (response.status === 401) {
        window.location.href = "/sign-in";
        throw new Error("Session expired");
      }
    }

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    return response;
  }, []);

  const get = useCallback(
    async <T>(path: string): Promise<T> => (await request(path)).json(),
    [request]
  );

  const post = useCallback(
    async <T>(path: string, body?: unknown): Promise<T> => {
      const response = await request(path, {
        method: "POST",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (response.status === 204) return undefined as T;
      return response.json();
    },
    [request]
  );

  const patch = useCallback(
    async <T>(path: string, body?: unknown): Promise<T> => {
      const response = await request(path, {
        method: "PATCH",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      return response.json();
    },
    [request]
  );

  const upload = useCallback(
    async <T>(path: string, formData: FormData): Promise<T> => {
      const response = await request(path, { method: "POST", body: formData });
      return response.json();
    },
    [request]
  );

  const del = useCallback(
    async (path: string): Promise<void> => {
      await request(path, { method: "DELETE" });
    },
    [request]
  );

  return { request, get, post, patch, upload, delete: del };
}
