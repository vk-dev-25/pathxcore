"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PathXTissueBankNavLink } from "@/components/pathx/tissue-bank-entry-confirm";
import { cn } from "@/lib/utils";

const items: { href: string; label: string; match: "exact" | "prefix" }[] = [
  { href: "/pathx", label: "Dashboard", match: "exact" },
  { href: "/pathx/quotebuilder", label: "New quote", match: "prefix" },
  { href: "/pathx/quotes", label: "Quote finder", match: "prefix" },
  { href: "/pathx/invoices", label: "Invoices", match: "prefix" },
  { href: "/pathx/admin/pricing", label: "Quote prices", match: "prefix" },
  { href: "/pathx/tissue-bank", label: "Tissue Blocks", match: "prefix" },
  { href: "/pathx/lims", label: "LIMS", match: "prefix" },
  {
    href: "/pathx/antibodies",
    label: "Antibodies",
    match: "prefix",
  },
  { href: "/pathx/trackers", label: "Trackers", match: "prefix" },
  { href: "/pathx/admin/staff", label: "Staff", match: "prefix" },
];

const clientItems: { href: string; label: string; match: "exact" | "prefix" }[] =
  [{ href: "/pathx/trackers", label: "Project Tracker", match: "prefix" }];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PathXNav({ clientMode = false }: { clientMode?: boolean }) {
  const pathname = usePathname();
  const navItems = clientMode ? clientItems : items;

  return (
    <nav
      className="border-b border-border bg-card/50"
      aria-label="PathX workspace"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2 sm:px-6">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href, item.match);
          const className = cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            active
              ? "bg-primary/15 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          );
          if (item.href === "/pathx/tissue-bank") {
            return (
              <PathXTissueBankNavLink
                key={item.href}
                active={active}
                className={className}
              >
                {item.label}
              </PathXTissueBankNavLink>
            );
          }
          return (
            <Link key={item.href} href={item.href} className={className}>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
