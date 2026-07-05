"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, KeyRound, LayoutDashboard, MessageSquare, Settings, Users } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useDocuments } from "@/lib/hooks/use-documents";
import { useChatSessions } from "@/lib/hooks/use-chat";

const PAGES = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/ask", label: "Ask", icon: MessageSquare },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings/api-keys", label: "API Keys", icon: KeyRound },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: documents } = useDocuments();
  const { data: sessions } = useChatSessions();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, documents, conversations…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {PAGES.map((page) => (
            <CommandItem key={page.href} value={page.label} onSelect={() => navigate(page.href)}>
              <page.icon className="mr-2 size-4" />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {documents && documents.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Documents">
              {documents.slice(0, 6).map((doc) => (
                <CommandItem
                  key={doc.id}
                  value={doc.name}
                  onSelect={() => navigate(`/dashboard/documents/${doc.id}`)}
                >
                  <FileText className="mr-2 size-4" />
                  {doc.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {sessions && sessions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent conversations">
              {sessions.slice(0, 5).map((session) => (
                <CommandItem
                  key={session.id}
                  value={session.title ?? "Untitled conversation"}
                  onSelect={() => navigate(`/dashboard/ask?session=${session.id}`)}
                >
                  <MessageSquare className="mr-2 size-4" />
                  {session.title || "Untitled conversation"}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
