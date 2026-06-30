"use client";

import { useAuth } from "@clerk/nextjs";
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

export function useApi() {
  const { getToken } = useAuth();

  const request = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      const token = await getToken();
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${token}`);
      if (init.body && !(init.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }
      const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
      return response;
    },
    [getToken]
  );

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

  const del = useCallback(
    async (path: string): Promise<void> => {
      await request(path, { method: "DELETE" });
    },
    [request]
  );

  return { request, get, post, patch, delete: del, getToken };
}
