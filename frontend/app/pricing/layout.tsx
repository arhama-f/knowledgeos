import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for teams of every size. Start free, scale as you grow.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
