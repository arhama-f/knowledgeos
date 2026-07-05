import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Layers,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Cited, grounded answers",
    description:
      "Every answer traces back to the exact document and page it came from. No hallucinations. No guesswork. Just accurate, auditable knowledge.",
  },
  {
    icon: Layers,
    title: "Every format, fully indexed",
    description:
      "PDF, Word, Excel, PowerPoint, CSV, plain text, images with OCR — indexed automatically the moment they're uploaded.",
  },
  {
    icon: Sparkles,
    title: "Your choice of AI model",
    description:
      "Switch between OpenAI, Anthropic, and Gemini per organization without touching a line of code. Your data, your models.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    description:
      "Org-level data isolation, role-based access control, API keys for integrations, and a complete audit trail.",
  },
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
      "Your team asks questions exactly how they'd ask a colleague. No search syntax, no training, no Boolean queries.",
  },
  {
    number: "03",
    icon: FileSearch,
    title: "Get a cited answer",
    description:
      "Responses stream back in seconds with every claim traceable to its source document and page number.",
  },
];

const STATS = [
  { value: "< 3s", label: "Average answer time" },
  { value: "3 providers", label: "OpenAI · Anthropic · Gemini" },
  { value: "99.9%", label: "Uptime SLA" },
];

const BULLETS = [
  "Answers grounded in your own documents",
  "Switch AI providers without code changes",
  "Enterprise security and org-level isolation",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      <main className="flex-1">
        {/* ── HERO ─────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#020817]">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute right-1/4 top-1/3 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute left-1/5 top-1/2 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl" />

          <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60 backdrop-blur-sm">
              <Zap className="size-3 text-primary" />
              Enterprise AI Knowledge Platform
            </span>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-7xl">
              Your company&apos;s knowledge,
              <br />
              <span
                style={{
                  backgroundImage: "linear-gradient(to right, oklch(0.51 0.24 276), oklch(0.65 0.2 280), oklch(0.6 0.18 240))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                answered instantly.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/50">
              Upload your documents. Ask questions in plain English. Get accurate, cited answers
              from your own knowledge base — powered by the AI model you choose.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Start for free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "white",
                }}
              >
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-white/25">
              No credit card required · Activate in minutes
            </p>
          </div>

          {/* Product mockup */}
          <div className="relative mx-auto max-w-5xl px-6">
            <div className="overflow-hidden rounded-t-xl border border-white/10 shadow-2xl shadow-black/60">
              {/* Browser chrome */}
              <div className="flex items-center gap-3 border-b border-white/10 bg-[#0D1117] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/40" />
                  <div className="size-3 rounded-full bg-amber-500/40" />
                  <div className="size-3 rounded-full bg-emerald-500/40" />
                </div>
                <div className="mx-auto max-w-xs flex-1 rounded-md bg-white/5 px-4 py-1 text-center text-xs text-white/25">
                  app.knowledgeos.ai/dashboard/ask
                </div>
              </div>

              {/* App UI */}
              <div className="flex h-80 bg-[#0D1117]">
                {/* Sidebar */}
                <div className="flex w-48 shrink-0 flex-col border-r border-white/10">
                  <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-3">
                    <div className="flex size-6 items-center justify-center rounded bg-primary text-[10px] font-bold text-white">
                      K
                    </div>
                    <span className="text-xs font-medium text-white">Acme Corp</span>
                  </div>
                  <div className="space-y-0.5 p-2 text-[11px]">
                    {["Overview", "Documents", "Ask", "Team"].map((item, i) => (
                      <div
                        key={item}
                        className={`rounded-md px-3 py-1.5 ${
                          i === 2
                            ? "bg-white/10 font-medium text-white"
                            : "text-white/40"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat */}
                <div className="flex flex-1 flex-col gap-5 p-6">
                  <div className="ml-auto max-w-[65%] rounded-xl bg-primary/20 px-4 py-2.5 text-sm text-white/90">
                    What&apos;s our vacation policy for remote employees?
                  </div>

                  <div className="space-y-3">
                    <p className="max-w-lg text-sm leading-relaxed text-white/70">
                      According to the{" "}
                      <span className="font-medium text-primary underline underline-offset-2">
                        Employee Handbook
                      </span>
                      , remote employees receive{" "}
                      <span className="font-semibold text-white">20 days</span> of paid vacation
                      annually, accruing from day one. Up to 5 unused days roll over per
                      year&hellip;
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Employee Handbook · p. 12", "HR Policy 2025 · p. 4"].map((src) => (
                        <span
                          key={src}
                          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/40"
                        >
                          📄 {src}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Fade out bottom of mockup */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#020817]" />
          </div>
        </section>

        {/* ── STATS BAR ─────────────────────────── */}
        <section className="border-y bg-secondary/40">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 px-6 py-10 sm:flex-row">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
                <p className="text-muted-foreground mt-1 text-sm">{stat.label}</p>
                {i < STATS.length - 1 && (
                  <div className="absolute hidden h-8 w-px bg-border sm:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────── */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for accuracy, not just speed
            </h2>
            <p className="text-muted-foreground mt-3 text-base">
              A real retrieval system, not a chatbot wrapper — every answer has a source you can
              click.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="text-primary size-5" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────── */}
        <section id="how-it-works" className="border-t bg-secondary/30 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                From upload to answer in minutes
              </h2>
              <p className="text-muted-foreground mt-3">
                No configuration. No training. No search syntax. Just upload and ask.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.title} className="flex flex-col items-center text-center">
                  <div className="border-primary text-primary mb-5 flex size-12 items-center justify-center rounded-full border-2 bg-background text-sm font-bold">
                    {step.number}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ───────────────────────── */}
        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="text-primary/30 text-5xl leading-none">&ldquo;</div>
          <blockquote className="mt-2 text-xl font-medium leading-relaxed tracking-tight sm:text-2xl">
            We replaced three internal wikis and a shared Google Drive with KnowledgeOS. Questions
            that used to take 20 minutes now take 10 seconds.
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full text-sm font-bold">
              S
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Sarah Chen</p>
              <p className="text-muted-foreground text-xs">Head of People, Series B startup</p>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────── */}
        <section className="relative overflow-hidden bg-[#020817] py-28 text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative mx-auto max-w-2xl px-6">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your team&apos;s knowledge, finally accessible.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/50">
              Join forward-thinking teams using KnowledgeOS to turn their institutional knowledge
              into instant, cited answers.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {BULLETS.map((bullet) => (
                <div key={bullet} className="flex items-center gap-1.5 text-xs text-white/40">
                  <CheckCircle2 className="size-3 text-primary" />
                  {bullet}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Get started — free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "white",
                }}
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
