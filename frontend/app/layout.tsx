import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "sonner";

import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KnowledgeOS — Enterprise AI Knowledge Platform",
    template: "%s — KnowledgeOS",
  },
  description: "Upload your company's documents. Ask anything. Get cited answers instantly.",
  openGraph: {
    type: "website",
    siteName: "KnowledgeOS",
    title: "KnowledgeOS — Enterprise AI Knowledge Platform",
    description: "Upload your company's documents. Ask anything. Get cited answers instantly.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KnowledgeOS — Enterprise AI Knowledge Platform",
    description: "Upload your company's documents. Ask anything. Get cited answers instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster richColors closeButton position="bottom-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
