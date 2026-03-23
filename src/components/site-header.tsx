"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/clinical-services", label: "Clinical services" },
  { href: "/preclinical-services", label: "Preclinical services" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary via-primary to-lab-purple text-sm font-bold text-primary-foreground shadow-[0_0_24px_-6px_hsl(var(--primary)/0.85)]">
            PX
          </span>
          <span className="hidden sm:inline">
            Path<span className="text-lab-purple">X</span>dx
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground",
                pathname === item.href &&
                  "bg-white/[0.08] text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="orange"
            size="sm"
            className="hidden font-semibold sm:inline-flex"
          >
            <Link href="/pathx/sign-in">Client sign in</Link>
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
                    className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/pathx/sign-in"
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-lab-orange hover:bg-white/[0.06]"
                >
                  Client sign in
                </Link>
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
