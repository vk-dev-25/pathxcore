"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links: { href: string; label: string; match: "exact" | "prefix" }[] = [
  { href: "/pathx/quotebuilder", label: "New quote", match: "prefix" },
  { href: "/pathx/quotes", label: "Quote finder", match: "prefix" },
  { href: "/pathx/invoices", label: "Invoices", match: "prefix" },
  { href: "/pathx/admin/pricing", label: "Quote prices", match: "prefix" },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PathXQuoteSubnav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border/60 bg-muted/25">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Quote
        </span>
        <nav
          className="flex flex-wrap gap-1"
          aria-label="Quote tools"
        >
          {links.map((item) => {
            const active = isActive(pathname, item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/12 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.22)]"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
