"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ServiceSlide = {
  title: string;
  description: string;
  href: string;
  cta: string;
  imageSrc: string;
  imageAlt: string;
  objectPosition?: string;
};

const INTERVAL_MS = 6500;

export function ServicesSlideshow({ slides }: { slides: ServiceSlide[] }) {
  const [index, setIndex] = useState(0);
  const n = slides.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + n) % n);
    },
    [n],
  );

  useEffect(() => {
    const id = window.setInterval(() => go(1), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [go]);

  const active = slides[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card/40 shadow-[0_0_60px_-24px_hsl(var(--primary)/0.35)]">
      <div className="relative aspect-[16/10] min-h-[280px] sm:aspect-[21/9] sm:min-h-[320px]">
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              i === index ? "z-[1] opacity-100" : "z-0 opacity-0 pointer-events-none",
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.imageSrc}
              alt={slide.imageAlt}
              fill
              sizes="(min-width: 1024px) 72rem, 100vw"
              className={cn(
                "object-cover",
                slide.objectPosition ?? "object-[center_35%]",
              )}
              priority={i === 0}
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/20 sm:via-background/75 sm:to-transparent"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30 sm:to-transparent"
              aria-hidden
            />
          </div>
        ))}

        <div className="relative z-[2] flex h-full flex-col justify-end p-6 sm:p-10 lg:max-w-[55%] lg:justify-center lg:pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Featured services
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {active.title}
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {active.description}
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="font-semibold">
              <Link href={active.href}>{active.cta}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-[2] flex items-center justify-between gap-4 border-t border-white/[0.06] bg-background/60 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex gap-1.5" role="tablist" aria-label="Service slides">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === index
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/20 hover:bg-white/35",
              )}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 border-white/15 bg-background/50"
            aria-label="Previous slide"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 border-white/15 bg-background/50"
            aria-label="Next slide"
            onClick={() => go(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
