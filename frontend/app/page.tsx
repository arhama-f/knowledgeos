import Link from "next/link";
import {
  ArrowRight,
  FileSearch,
  Layers,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Cited, grounded answers",
    description:
      "Every answer links back to the exact document and page it came from — no hallucinated facts, no guesswork.",
  },
  {
    icon: Layers,
    title: "Any document, any format",
    description:
      "PDFs, Word docs, and plain text are parsed, chunked, and indexed automatically the moment they're uploaded.",
  },
  {
    icon: Sparkles,
    title: "Bring your own model",
    description:
      "Run on OpenAI, Anthropic, or Gemini — switch providers per organization without touching a line of code.",
  },
  {
    icon: ShieldCheck,
    title: "Built for the enterprise",
    description:
      "Organization-level isolation, role-based access, and audit-ready API keys for every integration you build.",
  },
];

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload your documents",
    description:
      "Drop in policies, wikis, contracts, and reports. KnowledgeOS indexes them in the background.",
  },
  {
    icon: MessageSquareText,
    title: "Ask in plain English",
    description:
      "Employees ask questions the way they'd ask a colleague — no search syntax required.",
  },
  {
    icon: FileSearch,
    title: "Get a cited answer",
    description:
      "Responses stream back instantly, with every claim traceable to its source document and page.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="from-primary/10 via-primary/5 absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b to-transparent" />
          <div className="mx-auto max-w-4xl px-6 py-28 text-center">
            <span className="bg-card text-muted-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
              Enterprise AI Knowledge Platform
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              Your company&apos;s knowledge,
              <br /> answered instantly.
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
              Upload your documents. KnowledgeOS understands every one of them. Employees ask
              questions and get accurate, cited answers in seconds — not another endless search.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Get started <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Everything a knowledge platform needs to be trusted
            </h2>
            <p className="text-muted-foreground mt-3">
              Not a chatbot wrapper — a real retrieval system built for accuracy, security, and
              scale.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="flex gap-4 p-6">
                  <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <feature.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-secondary/30 border-t py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
              <p className="text-muted-foreground mt-3">From upload to answer in three steps.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="text-center">
                  <div className="bg-primary text-primary-foreground mx-auto flex size-12 items-center justify-center rounded-full">
                    <step.icon className="size-5" />
                  </div>
                  <p className="text-muted-foreground mt-4 text-xs font-semibold">
                    STEP {index + 1}
                  </p>
                  <h3 className="mt-1 font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Stop searching. Start asking.</h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl">
            Bring your team&apos;s knowledge into one place your whole company can actually use.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/sign-up">
              Get started <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
