"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminThemeToggle({ className }: { className?: string }) {
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
        size="sm"
        className={cn("min-w-[7.5rem]", className)}
        disabled
        aria-hidden
      >
        <span className="inline-block h-4 w-4" />
        Theme
      </Button>
    );
  }

  const isLight = resolvedTheme === "light";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("min-w-[7.5rem] border-border bg-background/80 font-medium", className)}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      {isLight ? (
        <Moon className="mr-1.5 h-4 w-4" aria-hidden />
      ) : (
        <Sun className="mr-1.5 h-4 w-4" aria-hidden />
      )}
      {isLight ? "Dark" : "Light"}
    </Button>
  );
}
