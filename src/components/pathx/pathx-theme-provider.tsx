"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function PathXThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="pathx-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
