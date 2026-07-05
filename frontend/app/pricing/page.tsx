"use client";

import { useState } from "react";
import { Check, Lock, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      "Ask with cited answers",
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
      "Yes. Every organization can switch between OpenAI, Anthropic, and Gemini from Settings at any time — no migration, no code changes required.",
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
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
            Simple, transparent pricing
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Pricing that scales with you
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base">
            From your first team to your whole company. Every plan includes cited answers,
            org-level security, and your choice of AI provider.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  "relative flex flex-col transition-shadow",
                  tier.highlighted && "border-primary shadow-lg shadow-primary/10"
                )}
              >
                {tier.highlighted && (
                  <span className="bg-primary text-primary-foreground absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-medium">
                    Most popular
                  </span>
                )}
                <CardHeader className="pb-4">
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="text-muted-foreground text-sm">{tier.description}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{tier.annualNote}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <ul className="flex-1 space-y-2.5 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="text-primary mt-0.5 size-4 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                    onClick={() =>
                      setActivePlan({ name: tier.name, price: `${tier.price}${tier.period}` })
                    }
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 border-dashed">
            <CardContent className="flex flex-col items-center justify-between gap-6 p-8 sm:flex-row">
              <div>
                <h3 className="text-lg font-semibold">Enterprise</h3>
                <p className="text-muted-foreground mt-1 max-w-md text-sm">
                  Unlimited employees, dedicated support, custom SLAs, security review, and VPC
                  deployment options. Typically{" "}
                  <span className="font-medium">$50,000–$100,000+/year</span> for large
                  organizations.
                </p>
              </div>
              <Button variant="outline" size="lg" className="shrink-0" asChild>
                <a href="mailto:hello@knowledgeos.ai?subject=Enterprise%20inquiry">
                  Talk to sales
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Trust signals */}
        <section className="border-y bg-secondary/30">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-6 py-8 sm:flex-row sm:gap-12">
            {TRUST.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-sm">
                <item.icon className="text-primary size-4 shrink-0" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-10 divide-y">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-5">
                <h3 className="font-medium">{faq.question}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {faq.answer}
                </p>
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
