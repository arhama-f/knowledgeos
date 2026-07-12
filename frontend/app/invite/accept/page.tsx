"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from "@/lib/api";

function AcceptForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [orgName, setOrgName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/members/invite/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail ?? "Could not accept invitation");
      setOrgName(data.org_name ?? "");
      setDone(true);
      setTimeout(() => router.push("/sign-in"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Invalid invitation</h1>
        <p className="text-muted-foreground text-sm">
          This invitation link is missing or malformed. Ask your admin to resend it.
        </p>
        <Link href="/sign-in" className="text-foreground text-sm font-medium underline-offset-4 hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to {orgName}!</h1>
        <p className="text-muted-foreground text-sm">
          Your account is ready. Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Accept your invitation</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Create your account to join your team on KnowledgeOS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your full name</Label>
          <Input
            id="name"
            required
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Choose a password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="8+ characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full gap-2" disabled={loading}>
          {loading ? "Joining…" : "Join workspace"}
          {!loading && <ArrowRight className="size-4" />}
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-foreground font-medium underline-offset-4 hover:underline">
            Sign in instead
          </Link>
        </p>
      </form>
    </>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
            K
          </div>
          <span className="font-semibold">KnowledgeOS</span>
        </div>
        <Suspense>
          <AcceptForm />
        </Suspense>
      </div>
    </div>
  );
}
