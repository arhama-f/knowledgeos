"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { useInvalidateAuth } from "@/lib/hooks/use-auth";

export default function SignUpPage() {
  const router = useRouter();
  const invalidate = useInvalidateAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", org_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(form);
      await invalidate();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
          <h1 className="text-xl font-semibold tracking-tight">Create your workspace</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your team&apos;s knowledge base starts here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" required value={form.name} onChange={set("name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={set("password")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="org_name">Company name</Label>
            <Input id="org_name" required value={form.org_name} onChange={set("org_name")} placeholder="Acme Corp" />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating workspace…" : "Get started"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-foreground font-medium underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
