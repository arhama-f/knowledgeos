import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  FileText,
  Layers,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";

const LOGOS = [
  "Meridian Health",
  "Vertex Labs",
  "Brightstone Co.",
  "Oakfield Ventures",
  "Cascade Systems",
  "NorthStar AI",
  "Luminary Group",
  "Foundry Inc.",
];

const STATS = [
  { value: "< 3s", label: "Average answer time" },
  { value: "500+", label: "Teams onboarded" },
  { value: "3", label: "AI providers supported" },
  { value: "99.9%", label: "Uptime SLA" },
];

const STEPS = [
  {
    number: "01",
    icon: UploadCloud,
    title: "Upload your documents",
    description:
      "Drop in policies, wikis, contracts, and reports. KnowledgeOS indexes them in the background — no manual tagging, no configuration.",
  },
  {
    number: "02",
    icon: MessageSquareText,
    title: "Ask in plain English",
    description:
      "Your team asks questions exactly how they'd ask a colleague. No search syntax, no training required.",
  },
  {
    number: "03",
    icon: FileSearch,
    title: "Get a cited answer",
    description:
      "Responses stream back in seconds with every claim traceable to its source document and page.",
  },
];

const PROVIDER_LIST = [
  { name: "Anthropic Claude", active: true },
  { name: "OpenAI GPT-4o", active: false },
  { name: "Google Gemini", active: false },
];

const FORMAT_LIST = ["PDF", "DOCX", "XLSX", "PPTX", "PNG", "TXT"];

const SECURITY_TAGS = ["Org isolation", "RBAC", "API keys", "Audit logs", "SSO ready"];

const CITATION_CHIPS = ["Q3 Handbook · p. 12", "Legal Policy · p. 7", "HR 2025 · p. 3"];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      <main className="flex-1">
        {/* ── HERO ───────────────────────────────────── */}
        <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-[#020817]">
          {/* Dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Vignette fade over dot grid */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, #020817 100%)",
            }}
          />

          {/* Animated orbs */}
          <div className="orb-1 pointer-events-none absolute left-1/4 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[130px]" />
          <div className="orb-2 pointer-events-none absolute bottom-1/4 right-1/4 h-[380px] w-[380px] rounded-full bg-blue-600/15 blur-[100px]" />
          <div className="orb-3 pointer-events-none absolute left-2/3 top-1/4 h-[260px] w-[260px] rounded-full bg-violet-600/12 blur-[80px]" />

          <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-16">
            {/* Badge */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/55 backdrop-blur-sm">
                <span className="badge-dot size-1.5 rounded-full bg-emerald-400" />
                Powered by OpenAI, Anthropic &amp; Gemini
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-7 text-center text-6xl font-bold tracking-tight text-white sm:text-7xl lg:text-[5.5rem] lg:leading-[1.05]">
              Your company&apos;s
              <br />
              knowledge,{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.7 0.18 280), oklch(0.51 0.24 276), oklch(0.6 0.2 250))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                answered.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-center text-lg leading-relaxed text-white/40 sm:text-xl">
              Upload documents. Ask anything in plain English. Get accurate, cited answers from your
              own knowledge base — and switch AI models without touching code.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="h-12 gap-2 px-8 text-[15px]" asChild>
                <Link href="/sign-up">
                  Start for free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-[15px]"
                asChild
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-7 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "oklch(0.48 0.22 276)",
                  "oklch(0.52 0.18 290)",
                  "oklch(0.56 0.2 260)",
                  "oklch(0.44 0.24 280)",
                  "oklch(0.6 0.16 250)",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className="flex size-7 items-center justify-center rounded-full border-2 border-[#020817] text-[10px] font-bold text-white"
                    style={{ background: bg }}
                  >
                    {["S", "M", "J", "A", "R"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/30">
                Joined by{" "}
                <span className="font-medium text-white/50">500+ knowledge-forward teams</span>
              </p>
            </div>

            {/* Product mockup */}
            <div className="relative mt-16">
              {/* Glow beneath mockup */}
              <div
                className="pointer-events-none absolute left-1/2 top-8 h-40 w-2/3 -translate-x-1/2 rounded-full blur-3xl"
                style={{ background: "oklch(0.51 0.24 276 / 0.3)" }}
              />

              {/* Tilted wrapper */}
              <div
                className="relative mx-auto max-w-4xl overflow-hidden rounded-xl"
                style={{
                  transform: "perspective(2000px) rotateX(4deg) scale(0.97)",
                  transformOrigin: "top center",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow:
                    "0 60px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-3 border-b border-white/8 bg-[#0D1117] px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-[#FF5F57]" />
                    <div className="size-3 rounded-full bg-[#FEBC2E]" />
                    <div className="size-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="mx-auto flex w-64 items-center gap-2 rounded-md bg-white/5 px-3 py-1.5">
                    <div className="size-1.5 rounded-full bg-emerald-400/60" />
                    <span className="text-[11px] text-white/25">
                      app.knowledgeos.ai/dashboard/ask
                    </span>
                  </div>
                  <div className="w-[60px]" />
                </div>

                {/* App UI */}
                <div className="flex h-[360px] bg-[#0D1117]">
                  {/* Sidebar */}
                  <div className="flex w-52 shrink-0 flex-col border-r border-white/8">
                    <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-3.5">
                      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-white">
                        K
                      </div>
                      <span className="text-xs font-semibold text-white">Acme Corp</span>
                      <div className="ml-auto size-2 rounded-full bg-emerald-400/70" />
                    </div>
                    <nav className="space-y-0.5 px-2 py-3 text-[11px]">
                      {[
                        { label: "Overview", badge: null, active: false },
                        { label: "Documents", badge: "47", active: false },
                        { label: "Ask AI", badge: null, active: true },
                        { label: "Team", badge: null, active: false },
                        { label: "Settings", badge: null, active: false },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`flex items-center rounded-md px-3 py-2 ${
                            item.active
                              ? "bg-primary/15 font-semibold text-primary"
                              : "text-white/30"
                          }`}
                        >
                          {item.label}
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-white/35">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      ))}
                    </nav>
                    <div className="mt-auto border-t border-white/5 p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300">
                          S
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-white/55">Sarah Chen</div>
                          <div className="text-[9px] text-white/25">Admin</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat pane */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between border-b border-white/8 px-6 py-3">
                      <span className="text-xs font-medium text-white/50">
                        AI Knowledge Assistant
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/70">
                        <div className="size-1.5 rounded-full bg-emerald-400/70" />
                        Online
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-5 overflow-hidden px-6 py-6">
                      {/* User message */}
                      <div className="flex justify-end">
                        <div className="max-w-[60%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-xs text-white">
                          What&apos;s our vacation policy for remote employees?
                        </div>
                      </div>

                      {/* AI response */}
                      <div className="flex items-start gap-3">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] text-primary">
                          ✦
                        </div>
                        <div className="space-y-3">
                          <p className="max-w-sm text-xs leading-relaxed text-white/60">
                            According to the{" "}
                            <span className="font-semibold text-primary/90 underline underline-offset-2">
                              Employee Handbook
                            </span>
                            , remote employees receive{" "}
                            <span className="font-semibold text-white">20 days</span> of paid
                            vacation annually, accruing from day one. Up to 5 unused days may roll
                            over per year…
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["Employee Handbook · p. 12", "HR Policy 2025 · p. 4"].map((src) => (
                              <span
                                key={src}
                                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/40"
                              >
                                <FileText className="size-2.5" />
                                {src}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Input bar */}
                    <div className="border-t border-white/8 px-4 pb-4 pt-3">
                      <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5">
                        <span className="flex-1 text-xs text-white/18">
                          Ask anything about your company knowledge…
                        </span>
                        <div className="flex size-6 items-center justify-center rounded-lg bg-primary">
                          <ArrowRight className="size-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom gradient fade */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020817]" />
            </div>
          </div>
        </section>

        {/* ── LOGOS STRIP ───────────────────────────── */}
        <section className="border-y border-white/5 bg-[#020817] py-10">
          <div className="mx-auto max-w-5xl px-6">
            <p className="mb-7 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/18">
              Used by knowledge-forward teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {LOGOS.map((name) => (
                <span
                  key={name}
                  className="text-sm font-medium text-white/18 transition-colors hover:text-white/38"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────── */}
        <section className="border-b">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px bg-border sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-background p-10 text-center">
                <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                <p className="text-muted-foreground mt-2 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES BENTO ────────────────────────── */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="bg-primary/10 text-primary inline-flex rounded-full px-3 py-1 text-xs font-semibold">
              Features
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Built for accuracy, not just speed
            </h2>
            <p className="text-muted-foreground mt-3 text-base">
              A real retrieval system, not a chatbot wrapper. Every answer has a source you can click.
            </p>
          </div>

          {/* Bento: 5-column grid */}
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-5">
            {/* Large: Cited answers — spans 3 cols */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 sm:col-span-3">
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <FileSearch className="text-primary size-5" />
              </div>
              <h3 className="text-xl font-semibold">Cited, grounded answers</h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                Every answer traces back to the exact document and page it came from. No
                hallucinations. No guesswork. Just accurate, auditable knowledge — with a single
                click to verify.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {CITATION_CHIPS.map((src) => (
                  <span
                    key={src}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary/70"
                  >
                    <FileText className="size-3" />
                    {src}
                  </span>
                ))}
              </div>
              <div
                className="pointer-events-none absolute -bottom-16 -right-16 size-48 rounded-full blur-3xl"
                style={{ background: "oklch(0.51 0.24 276 / 0.08)" }}
              />
            </div>

            {/* Small: Every format — spans 2 cols */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 sm:col-span-2">
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Layers className="size-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold">Every format, indexed</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                PDF, Word, Excel, PowerPoint, images with OCR — processed automatically the moment
                they&apos;re uploaded.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-1.5">
                {FORMAT_LIST.map((fmt) => (
                  <span
                    key={fmt}
                    className="rounded-md border bg-secondary/50 px-2 py-1.5 text-center text-xs font-mono font-medium text-muted-foreground"
                  >
                    .{fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Small: AI model — spans 2 cols */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 sm:col-span-2">
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-violet-500/10">
                <Sparkles className="size-5 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold">Your choice of AI</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Switch between OpenAI, Anthropic, and Gemini per organization. No migrations, no
                code changes.
              </p>
              <div className="mt-5 space-y-1.5">
                {PROVIDER_LIST.map((p) => (
                  <div
                    key={p.name}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
                      p.active
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`size-1.5 rounded-full ${p.active ? "bg-primary" : "bg-muted-foreground/25"}`}
                    />
                    {p.name}
                    {p.active && (
                      <span className="ml-auto text-[10px] text-primary/60">Active</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Wide: Security — spans 3 cols */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 sm:col-span-3">
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <ShieldCheck className="size-5 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold">Enterprise-grade security</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Org-level data isolation, role-based access control, API keys for integrations, and
                a complete audit trail. Your documents never leave your isolated workspace.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {SECURITY_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div
                className="pointer-events-none absolute -bottom-12 -right-12 size-40 rounded-full blur-3xl"
                style={{ background: "oklch(0.6 0.15 150 / 0.07)" }}
              />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────── */}
        <section id="how-it-works" className="border-t bg-secondary/20 py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="bg-primary/10 text-primary inline-flex rounded-full px-3 py-1 text-xs font-semibold">
                How it works
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                From upload to answer in minutes
              </h2>
              <p className="text-muted-foreground mt-3 text-base">
                No configuration. No training. No search syntax. Just upload and ask.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative rounded-2xl border bg-card p-8">
                  <div
                    className="mb-4 text-6xl font-black leading-none tracking-tighter"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, oklch(0.51 0.24 276), oklch(0.65 0.2 280))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {step.number}
                  </div>
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <step.icon className="text-primary size-5" />
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {step.description}
                  </p>
                  {i < STEPS.length - 1 && (
                    <div className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 sm:block">
                      <ArrowRight className="text-muted-foreground/20 size-8" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ───────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 py-28">
          <div className="rounded-3xl border bg-card p-10 text-center sm:p-14">
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="size-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="mx-auto mt-6 max-w-2xl text-xl font-semibold leading-relaxed tracking-tight sm:text-2xl">
              &ldquo;We replaced three internal wikis and a shared Google Drive with KnowledgeOS.
              Questions that used to take 20 minutes now take{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(to right, oklch(0.51 0.24 276), oklch(0.65 0.2 280))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                10 seconds.
              </span>
              &rdquo;
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div
                className="flex size-11 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: "oklch(0.51 0.24 276)" }}
              >
                S
              </div>
              <div className="text-left">
                <p className="font-semibold">Sarah Chen</p>
                <p className="text-muted-foreground text-sm">Head of People · Series B SaaS</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#020817] py-32">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 50%, oklch(0.51 0.24 276 / 0.2), transparent)",
            }}
          />
          <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 translate-y-1/2 rounded-full bg-violet-600/12 blur-3xl" />

          <div className="relative mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Your team&apos;s knowledge,
              <br />
              finally accessible.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-white/38">
              Join 500+ forward-thinking teams using KnowledgeOS to turn their institutional
              knowledge into instant, cited answers.
            </p>

            <ul className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {[
                "Answers grounded in your documents",
                "Switch AI providers without code",
                "Enterprise security, org-level isolation",
              ].map((bullet) => (
                <li key={bullet} className="flex items-center gap-2 text-xs text-white/38">
                  <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="h-12 gap-2 px-8 text-[15px]" asChild>
                <Link href="/sign-up">
                  Get started — free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-[15px]"
                asChild
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>

            <p className="mt-5 text-xs text-white/20">
              No credit card required · Setup in under 5 minutes
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
