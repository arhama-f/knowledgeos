"use client";

import { useState } from "react";
import { ArrowRight, Check, Lock, MessageSquare, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";
import { PaymentModal } from "@/components/payment-modal";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Starter",
    price: "$499",
    period: "/month",
    annualNote: "Billed annually · ≈ $5,988/year",
    description: "For teams getting their first knowledge base off the ground.",
    features: [
      "Up to 25 employees",
      "500 documents",
      "Ask AI with cited answers",
      "1 AI provider of your choice",
      "Email support",
    ],
    highlighted: false,
    cta: "Start with Starter",
  },
  {
    name: "Business",
    price: "$1,499",
    period: "/month",
    annualNote: "Billed annually · ≈ $17,988/year",
    description: "For growing companies whose knowledge has outgrown a wiki.",
    features: [
      "Up to 250 employees",
      "Unlimited documents",
      "All file formats (PDF, Word, Excel, images)",
      "Switch AI providers anytime",
      "API access and integrations",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start with Business",
  },
];

const FAQS = [
  {
    question: "How does billing work?",
    answer:
      "Plans are billed annually via bank transfer. After checkout you'll see our account details and an order confirmation — your workspace is activated within 1 business day of payment.",
  },
  {
    question: "Can we change AI providers later?",
    answer:
      "Yes. Every organization can switch AI providers from Settings at any time — no migration, no code changes required.",
  },
  {
    question: "What happens to our data?",
    answer:
      "Each company's documents and conversations are isolated at the database level. Nothing is shared across organizations, and you can export or delete your data at any time.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "We offer a hands-on demo and guided setup call for all new customers. Reach out to hello@knowledgeos.ai to get started.",
  },
];

const TRUST = [
  { icon: ShieldCheck, label: "Org-level data isolation" },
  { icon: Lock, label: "Role-based access control" },
  { icon: Zap, label: "99.9% uptime SLA" },
];

export default function PricingPage() {
  const [activePlan, setActivePlan] = useState<{ name: string; price: string } | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden bg-[#020817] py-24 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />

          <div className="relative mx-auto max-w-2xl px-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/55">
              Simple, transparent pricing
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Pricing that scales with you
            </h1>
            <p className="mt-4 text-base text-white/40">
              From your first team to your whole company. Every plan includes cited answers,
              org-level security, and your choice of AI provider.
            </p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-8 transition-shadow",
                  tier.highlighted
                    ? "border-primary shadow-xl shadow-primary/10"
                    : "bg-card shadow-sm"
                )}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3.5 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{tier.description}</p>
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tight">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">{tier.annualNote}</p>
                </div>

                <ul className="mt-7 flex-1 space-y-3 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn("mt-8 w-full gap-2", tier.highlighted ? "" : "")}
                  variant={tier.highlighted ? "default" : "outline"}
                  onClick={() =>
                    setActivePlan({ name: tier.name, price: `${tier.price}${tier.period}` })
                  }
                >
                  {tier.cta}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Enterprise */}
          <div className="mt-6 flex flex-col items-start justify-between gap-6 rounded-2xl border border-dashed bg-card p-8 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold">Enterprise</h3>
              <p className="text-muted-foreground mt-1.5 max-w-md text-sm leading-relaxed">
                Unlimited employees, dedicated support, custom SLAs, security review, and VPC
                deployment options. Typically{" "}
                <span className="text-foreground font-medium">$50,000–$100,000+/year</span> for
                large organizations.
              </p>
            </div>
            <Button variant="outline" size="lg" className="shrink-0 gap-2" asChild>
              <a href="mailto:hello@knowledgeos.ai?subject=Enterprise%20inquiry">
                <MessageSquare className="size-4" />
                Talk to sales
              </a>
            </Button>
          </div>
        </section>

        {/* Trust signals */}
        <section className="border-y bg-secondary/30">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 px-6 py-8 sm:flex-row sm:gap-14">
            {TRUST.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-sm">
                <item.icon className="size-4 shrink-0 text-primary" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-10 divide-y">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-6">
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />

      {activePlan && (
        <PaymentModal
          open={!!activePlan}
          onOpenChange={(open) => !open && setActivePlan(null)}
          planName={activePlan.name}
          priceLabel={activePlan.price}
        />
      )}
    </div>
  );
}
