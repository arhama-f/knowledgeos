"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { useInvalidateAuth } from "@/lib/hooks/use-auth";

const BULLETS = [
  "Cited answers from your own knowledge base",
  "OpenAI, Anthropic, or Gemini — you choose",
  "Org-level isolation and role-based access",
];

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
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#020817] p-12 lg:flex lg:w-1/2">
        <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-1/4 translate-y-1/4 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
            K
          </div>
          <span className="text-lg font-semibold text-white">KnowledgeOS</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-semibold leading-snug tracking-tight text-white">
            Your team&apos;s knowledge,
            <br />
            finally searchable.
          </h2>
          <p className="mt-4 max-w-sm text-base text-white/50">
            Build a knowledge base your whole company can ask questions against — in plain English,
            with cited answers.
          </p>

          <ul className="mt-8 space-y-3">
            {BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                <span className="text-sm text-white/65">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/25">
          © {new Date().getFullYear()} KnowledgeOS
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-sm font-bold">
              K
            </div>
            <span className="font-semibold">KnowledgeOS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Your team&apos;s knowledge base starts here. Free to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">Your full name</Label>
                <Input
                  id="name"
                  required
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={set("name")}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="org_name">Company name</Label>
                <Input
                  id="org_name"
                  required
                  placeholder="Acme Corp"
                  value={form.org_name}
                  onChange={set("org_name")}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={set("email")}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="8+ characters"
                  value={form.password}
                  onChange={set("password")}
                />
              </div>
            </div>

            {error && (
              <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating workspace…" : "Get started — free"}
            </Button>

            <p className="text-muted-foreground text-center text-xs">
              No credit card required. Cancel anytime.
            </p>
          </form>

          <p className="text-muted-foreground mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
