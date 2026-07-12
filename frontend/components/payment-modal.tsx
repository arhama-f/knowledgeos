"use client";

import { useState } from "react";
import { Building2, CheckCircle2, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const WISE_LINKS: Record<string, string> = {
  Starter: process.env.NEXT_PUBLIC_WISE_LINK_STARTER ?? "#",
  Business: process.env.NEXT_PUBLIC_WISE_LINK_BUSINESS ?? "#",
};

type Method = "card" | "bank";

const METHODS: { id: Method; icon: React.ElementType; title: string; description: string }[] = [
  {
    id: "card",
    icon: CreditCard,
    title: "Pay by card",
    description: "Visa, Mastercard, Amex — via Wise's secure payment page.",
  },
  {
    id: "bank",
    icon: Building2,
    title: "Bank transfer",
    description: "GBP, USD, or EUR. We'll email our bank details within 1 business day.",
  },
];

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  priceLabel: string;
}

export function PaymentModal({ open, onOpenChange, planName, priceLabel }: PaymentModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [method, setMethod] = useState<Method | null>(null);
  const [selected, setSelected] = useState<Method | null>(null);

  function reset() {
    setConfirmed(false);
    setMethod(null);
    setSelected(null);
  }

  function handleContinue() {
    if (!selected) return;
    setMethod(selected);
    if (selected === "card") {
      const link = WISE_LINKS[planName];
      window.open(link, "_blank", "noopener,noreferrer");
    }
    setConfirmed(true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        {confirmed ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {method === "card" ? "Payment page opened" : "We'll be in touch"}
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {method === "card"
                  ? `Complete your payment on the Wise page that just opened. Your ${planName} workspace will be activated within 1 business day of receipt.`
                  : `Thanks for choosing the ${planName} plan. We'll email our bank details within 1 business day and activate your workspace on receipt.`}
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              Questions?{" "}
              <a
                href="mailto:hello@knowledgeos.ai"
                className="text-primary underline-offset-4 hover:underline"
              >
                hello@knowledgeos.ai
              </a>
            </p>
            {method === "card" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(WISE_LINKS[planName], "_blank", "noopener,noreferrer")}
              >
                Reopen payment page
              </Button>
            )}
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>How would you like to pay?</DialogTitle>
              <DialogDescription>
                {planName} plan — {priceLabel}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              {METHODS.map(({ id, icon: Icon, title, description }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelected(id)}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                    selected === id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      selected === id ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <Button className="w-full" disabled={!selected} onClick={handleContinue}>
              Continue
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
