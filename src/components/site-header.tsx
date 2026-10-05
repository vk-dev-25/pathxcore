"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HomeThemeToggle } from "@/components/home-theme-toggle";
import { TissueBrowseMenu } from "@/components/tissue/tissue-browse-menu";
import { cn } from "@/lib/utils";

const TISSUE_HREF = "/tissue-bank";

const nav = [
  { href: "/", label: "Home", featured: false },
  { href: "/preclinical-services", label: "Services", featured: false },
  { href: TISSUE_HREF, label: "Tissue Blocks", featured: true },
  { href: "/contact", label: "Contact", featured: false },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [tissueOpen, setTissueOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openTissue() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setTissueOpen(true);
  }

  // Short delay so the pointer can cross the header padding into the panel.
  function closeTissueSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setTissueOpen(false), 150);
  }

  useEffect(() => {
    setTissueOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!tissueOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setTissueOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tissueOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Image
            src="/images/pathxlogo.jpeg"
            alt="PathXdx"
            width={258}
            height={236}
            className="h-14 w-auto sm:h-16"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {nav.map((item) => {
            const className = cn(
              "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground",
              item.featured &&
                "text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.55)]",
              (pathname === item.href ||
                (item.href === TISSUE_HREF &&
                  pathname.startsWith(`${TISSUE_HREF}/`))) &&
                "bg-white/[0.08] text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]",
            );
            if (item.href !== TISSUE_HREF) {
              return (
                <Link key={item.href} href={item.href} className={className}>
                  {item.label}
                </Link>
              );
            }
            // Not `relative`: the panel positions against the sticky header so
            // it spans the full width, while staying inside this hover area.
            return (
              <div
                key={item.href}
                className={cn(className, "flex items-center gap-1 pr-1.5")}
                onMouseEnter={openTissue}
                onMouseLeave={closeTissueSoon}
              >
                <Link href={item.href}>{item.label}</Link>
                <button
                  type="button"
                  aria-expanded={tissueOpen}
                  aria-controls="tissue-menu"
                  aria-label={
                    tissueOpen
                      ? "Close tissue blocks menu"
                      : "Open tissue blocks menu"
                  }
                  // Hover already opened it for mouse users, so a mouse click
                  // keeps it open; keyboard activation (detail 0) toggles.
                  onClick={(event) =>
                    setTissueOpen((open) => (event.detail === 0 ? !open : true))
                  }
                  className="rounded p-0.5 hover:bg-white/[0.08]"
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      tissueOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                {tissueOpen ? (
                  <div
                    id="tissue-menu"
                    className="absolute inset-x-0 top-full cursor-default border-b border-border/80 bg-background/95 text-base font-normal text-foreground shadow-lg backdrop-blur-xl"
                  >
                    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
                      <TissueBrowseMenu
                        onNavigate={() => setTissueOpen(false)}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {pathname === "/" ? <HomeThemeToggle /> : null}
          <Button
            asChild
            variant="workspace"
            size="sm"
            className="hidden font-medium sm:inline-flex"
          >
            <Link href="/pathx/sign-in">Sign in</Link>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="gap-6 border-border/80 bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Menu</DialogTitle>
              </DialogHeader>
              <nav className="flex flex-col gap-1">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
                      item.featured &&
                        "text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.55)]",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/pathx/sign-in"
                  className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-3 text-sm font-medium text-foreground backdrop-blur-sm hover:bg-white/[0.08]"
                >
                  Sign in
                </Link>
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
