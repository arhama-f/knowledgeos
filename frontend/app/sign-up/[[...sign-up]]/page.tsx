"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { useInvalidateAuth } from "@/lib/hooks/use-auth";

const PROMISES = [
  "Cited answers grounded in your own documents",
  "Switch AI providers without code changes",
  "Org-level isolation and role-based access",
  "Setup takes less than 5 minutes",
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
      {/* Left panel */}
      <div className="relative hidden flex-col overflow-hidden bg-[#020817] lg:flex lg:w-1/2">
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Gradient blobs */}
        <div className="orb-1 pointer-events-none absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="orb-2 pointer-events-none absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="pointer-events-none absolute left-2/3 top-1/3 h-56 w-56 rounded-full bg-violet-600/10 blur-3xl" />

        {/* Top logo */}
        <div className="relative p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              K
            </div>
            <span className="text-lg font-semibold text-white">KnowledgeOS</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative flex flex-1 flex-col justify-center px-10">
          <h2 className="text-5xl font-bold leading-tight tracking-tight text-white">
            Your team&apos;s knowledge,
            <br />
            <span
              style={{
                backgroundImage:
                  "linear-gradient(135deg, oklch(0.7 0.18 280), oklch(0.51 0.24 276), oklch(0.6 0.2 250))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              finally searchable.
            </span>
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/45">
            Build a knowledge base your whole company can query in plain English — with accurate,
            cited answers powered by the AI you choose.
          </p>

          {/* Promise list */}
          <ul className="mt-10 space-y-4">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-sm text-white/60">{p}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["oklch(0.48 0.22 276)", "oklch(0.52 0.18 290)", "oklch(0.44 0.24 280)"].map(
                (bg, i) => (
                  <div
                    key={i}
                    className="flex size-7 items-center justify-center rounded-full border-2 border-[#020817] text-[10px] font-bold text-white"
                    style={{ background: bg }}
                  >
                    {["S", "M", "J"][i]}
                  </div>
                )
              )}
            </div>
            <p className="text-xs text-white/30">
              Joined by <span className="font-medium text-white/50">500+ teams</span> already
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative p-10 text-xs text-white/20">
          © {new Date().getFullYear()} KnowledgeOS · All rights reserved
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
              K
            </div>
            <span className="font-semibold">KnowledgeOS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create your workspace</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Your team&apos;s knowledge base starts here. Free to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Your full name</Label>
              <Input
                id="name"
                required
                placeholder="Jane Smith"
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org_name">Company name</Label>
              <Input
                id="org_name"
                required
                placeholder="Acme Corp"
                value={form.org_name}
                onChange={set("org_name")}
              />
            </div>
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
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

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? "Creating workspace…" : "Get started — free"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>

            <p className="text-muted-foreground text-center text-xs">
              No credit card required · Cancel anytime
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
