"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { useInvalidateAuth } from "@/lib/hooks/use-auth";

export default function SignInPage() {
  const router = useRouter();
  const invalidate = useInvalidateAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      await invalidate();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-secondary/30 flex min-h-screen items-center justify-center px-4">
      <div className="bg-card w-full max-w-sm rounded-xl border p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="bg-primary text-primary-foreground mx-auto mb-3 flex size-9 items-center justify-center rounded-lg text-sm font-bold">
            K
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Sign in to KnowledgeOS</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          No account?{" "}
          <Link href="/sign-up" className="text-foreground font-medium underline-offset-4 hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
