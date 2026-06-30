"use client";

import { useState } from "react";
import { Check } from "lucide-react";

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
    period: "/month, billed annually",
    annualNote: "≈ $5,988/year",
    description: "For teams getting their first knowledge base off the ground.",
    features: ["Up to 25 employees", "500 documents", "Ask with citations", "Email support"],
  },
  {
    name: "Business",
    price: "$1,499",
    period: "/month, billed annually",
    annualNote: "≈ $17,988/year",
    description: "For growing companies whose knowledge has outgrown a wiki.",
    features: [
      "Up to 250 employees",
      "Unlimited documents",
      "Priority support",
      "API access & integrations",
      "Choice of AI provider",
    ],
    highlighted: true,
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
      "Yes. Every organization can switch between OpenAI, Anthropic, and Gemini from Settings at any time — no migration, no code changes.",
  },
  {
    question: "What happens to our data?",
    answer:
      "Each company's documents and conversations are isolated at the database level. Nothing is shared across organizations, and you can export or delete your data at any time.",
  },
];

export default function PricingPage() {
  const [activePlan, setActivePlan] = useState<{ name: string; price: string } | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Pricing that scales with you</h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
            From your first team to your whole company. Every plan includes cited answers,
            organization-level security, and your choice of AI provider.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={cn("relative", tier.highlighted && "border-primary shadow-md")}
              >
                {tier.highlighted && (
                  <span className="bg-primary text-primary-foreground absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-medium">
                    Most popular
                  </span>
                )}
                <CardHeader>
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="text-muted-foreground text-sm">{tier.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{tier.annualNote}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="text-primary size-4" />
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
                    Get started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-between gap-4 p-8 sm:flex-row">
              <div>
                <h3 className="text-lg font-semibold">Enterprise</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Unlimited employees, dedicated support, custom SLAs, security review, and VPC
                  deployment options. Typically $50,000–$100,000+/year for large organizations.
                </p>
              </div>
              <Button variant="outline" size="lg" asChild>
                <a href="mailto:hello@knowledgeos.ai?subject=Enterprise%20inquiry">Talk to sales</a>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-medium">{faq.question}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{faq.answer}</p>
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
