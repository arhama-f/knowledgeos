"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Quote } from "lucide-react";

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
        <div className="orb-1 pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="orb-2 pointer-events-none absolute -bottom-32 -right-32 h-[380px] w-[380px] rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

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
            The enterprise
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
              knowledge platform.
            </span>
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/45">
            Upload your company&apos;s documents and give every employee instant, cited answers
            — backed by the AI model you choose.
          </p>

          {/* Testimonial */}
          <div className="mt-12 rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm">
            <Quote className="mb-3 size-4 text-primary/60" />
            <p className="text-sm leading-relaxed text-white/60">
              Questions that used to take 20 minutes now take 10 seconds. Every employee finally
              has access to the company&apos;s collective knowledge.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="flex size-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "oklch(0.51 0.24 276)" }}
              >
                S
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70">Sarah Chen</p>
                <p className="text-[11px] text-white/35">Head of People · Series B SaaS</p>
              </div>
            </div>
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
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Sign in to your workspace to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground text-xs underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
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
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <p className="text-muted-foreground mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Create a workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
