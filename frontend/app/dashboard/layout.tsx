import type { Metadata } from "next";

import { Sidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = { title: "Dashboard" };
import { DashboardTopBar } from "@/components/dashboard/topbar";
import { CommandPalette } from "@/components/dashboard/command-palette";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto bg-secondary/20">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
