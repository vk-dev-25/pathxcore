import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

/** Breadcrumb plus a coloured hero band, shared by the Tissue Blocks pages. */
export function TissuePageHeader({
  crumbs,
  eyebrow,
  title,
  children,
  actions,
  aside,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  /** Decorative content shown to the right of the text on large screens. */
  aside?: React.ReactNode;
}) {
  return (
    <header>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {crumbs.map((crumb, i) => (
            <li key={crumb.label} className="flex items-center gap-1">
              {i > 0 ? (
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              ) : null}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-foreground">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/20 via-card to-lab-purple/20 px-6 py-10 sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-lab-purple/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
          aria-hidden
        />
        <div className="relative flex items-center justify-between gap-10">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  aria-hidden
                />
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-4 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
              {title}
            </h1>
            {children ? (
              <div className="mt-4 max-w-2xl space-y-3 text-muted-foreground">
                {children}
              </div>
            ) : null}
            {actions ? (
              <div className="mt-7 flex flex-wrap gap-3">{actions}</div>
            ) : null}
          </div>
          {aside ? (
            <div className="hidden shrink-0 lg:block">{aside}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
