"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BANK_DETAILS = [
  { label: "Account name", value: "PsychFlo" },
  { label: "Account number", value: "75872793" },
  { label: "Sort code", value: "60-84-64" },
  { label: "SWIFT/BIC", value: "TRWIGB2LXXX" },
  { label: "Bank", value: "Wise" },
  { label: "Currency", value: "GBP (£)" },
];

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  priceLabel: string;
}

export function PaymentModal({ open, onOpenChange, planName, priceLabel }: PaymentModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setConfirmed(false);
      }}
    >
      <DialogContent>
        {confirmed ? (
          <>
            <DialogHeader>
              <DialogTitle>You&apos;re all set</DialogTitle>
              <DialogDescription>
                We&apos;ll activate your {planName} plan within 1 business day of receiving payment.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted text-muted-foreground rounded-lg p-4 text-sm">
              <p>What happens next:</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Send the transfer using your company name as the reference</li>
                <li>We&apos;ll email you once your workspace is activated</li>
                <li>
                  Questions? Email{" "}
                  <a href="mailto:hello@knowledgeos.ai" className="text-primary">
                    hello@knowledgeos.ai
                  </a>
                </li>
              </ul>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pay via bank transfer</DialogTitle>
              <DialogDescription>
                {planName} plan — {priceLabel}. Use your company name as the payment reference.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/40 space-y-2 rounded-lg border p-4">
              {BANK_DETAILS.map((detail) => (
                <div key={detail.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{detail.label}</span>
                  <button
                    type="button"
                    className="hover:text-primary flex items-center gap-1.5 font-medium"
                    onClick={() => navigator.clipboard.writeText(detail.value)}
                  >
                    {detail.value}
                    <Copy className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setConfirmed(true)}>
                <Check className="size-4" /> I&apos;ve sent the payment
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
