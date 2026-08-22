"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn("h-8 w-8 shrink-0", className)}
        disabled
        aria-hidden
      >
        <span className="inline-block h-4 w-4" />
      </Button>
    );
  }

  const isLight = resolvedTheme === "light";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "h-8 w-8 shrink-0 border-white/[0.12] bg-background/70 text-foreground backdrop-blur-sm hover:bg-white/[0.08]",
        className,
      )}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      {isLight ? (
        <Moon className="h-4 w-4" aria-hidden />
      ) : (
        <Sun className="h-4 w-4" aria-hidden />
      )}
    </Button>
  );
}
