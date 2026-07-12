"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/password-reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Something went wrong");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
            K
          </div>
          <span className="font-semibold">KnowledgeOS</span>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset
                link. It expires in 1 hour.
              </p>
            </div>
            <Link
              href="/sign-in"
              className="text-foreground flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Enter the email address for your account and we&apos;ll send you a reset link.
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

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
                {!loading && <ArrowRight className="size-4" />}
              </Button>
            </form>

            <p className="text-muted-foreground mt-6 text-center text-sm">
              <Link
                href="/sign-in"
                className="text-foreground flex items-center justify-center gap-1.5 font-medium underline-offset-4 hover:underline"
              >
                <ArrowLeft className="size-4" />
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
