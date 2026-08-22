/** Shared PathX workspace field surfaces: visible borders in light theme, glass styling in dark. */

export const pathxFieldClass =
  "border border-border bg-background text-foreground shadow-none backdrop-blur-sm placeholder:text-muted-foreground focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0 dark:border-white/[0.12] dark:bg-white/[0.04]";

export const pathxCardClass =
  "border border-border bg-card/80 shadow-none backdrop-blur-xl dark:border-white/[0.08] dark:bg-card/50";

/** Cards that use a subtle primary glow on hover (quote builder, admin pricing). */
export const pathxCardClassHover =
  "border border-border bg-card/80 shadow-none backdrop-blur-xl transition-[box-shadow,border-color] duration-300 hover:shadow-[0_0_24px_-16px_hsl(var(--primary)/0.2)] dark:border-white/[0.08] dark:bg-card/50 dark:hover:shadow-[0_0_40px_-24px_hsl(var(--primary)/0.25)]";
