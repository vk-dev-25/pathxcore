import Image from "next/image";

import { cn } from "@/lib/utils";

export const BRAND_TAGLINE = "From tissue to slide";

/**
 * Logo with the tagline beneath. The logo artwork (white lettering, light grey
 * microscope) is drawn for a dark background: `framed` puts it on its own dark
 * badge (footer); unframed is for surfaces that are already dark (header band).
 */
export function BrandLockup({
  size = "sm",
  framed = true,
  priority = false,
  className,
}: {
  size?: "sm" | "lg";
  framed?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const large = size === "lg";
  return (
    <span
      className={cn(
        "relative inline-flex flex-col items-center",
        framed &&
          "overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1220] via-[#10283a] to-[#2a1640] shadow-md ring-1 ring-white/10",
        framed && (large ? "px-4 pb-2.5 pt-1.5" : "px-3 pb-1.5 pt-0.5"),
        className,
      )}
    >
      {framed ? (
        <>
          <span
            className="pointer-events-none absolute -left-6 -top-8 h-16 w-16 rounded-full bg-primary/40 blur-2xl"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -bottom-8 -right-6 h-16 w-16 rounded-full bg-lab-purple/40 blur-2xl"
            aria-hidden
          />
        </>
      ) : null}
      <Image
        src="/images/pathxlogo.jpeg"
        alt="PathXdx"
        width={258}
        height={236}
        priority={priority}
        className={cn("relative w-auto", large ? "h-20" : "h-14 sm:h-16")}
      />
      <span
        className={cn(
          "relative whitespace-nowrap font-semibold uppercase text-teal-300",
          large
            ? "-mt-1 text-[11px] tracking-[0.14em]"
            : "-mt-1 text-[9px] tracking-[0.1em] sm:text-[10px]",
        )}
      >
        {BRAND_TAGLINE}
      </span>
    </span>
  );
}
