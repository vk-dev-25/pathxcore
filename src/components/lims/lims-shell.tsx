"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderOpen, ClipboardList, Microscope,
  Layers, Printer, FlaskConical, Library, BookOpen, Building2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/pathx/lims",                       label: "Dashboard",            icon: LayoutDashboard },
  { href: "/pathx/lims/projects",              label: "Projects",             icon: FolderOpen },
  { href: "/pathx/lims/accessions",            label: "Accessions",           icon: ClipboardList },
  { href: "/pathx/lims/specimens",             label: "Specimens",            icon: Microscope },
  { href: "/pathx/lims/slides",               label: "Slides",               icon: Layers },
  { href: "/pathx/lims/label-designer",       label: "Label Designer",       icon: Printer },
  { href: "/pathx/lims/ihc-assay-dev",        label: "IHC Assay Dev",        icon: FlaskConical },
  { href: "/pathx/lims/inhouse-library",      label: "In-House Library",     icon: Library },
  { href: "/pathx/lims/tissue-abbreviations", label: "Tissue Abbreviations", icon: BookOpen },
  { href: "/pathx/lims/clients",              label: "Clients",              icon: Building2 },
];

export function LimsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-border/60 flex flex-col bg-background">
        <div className="px-4 py-3 border-b border-border/60">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            PathxDx LIMS
          </span>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/pathx/lims"
                  ? pathname === "/pathx/lims"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
