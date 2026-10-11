import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { TissuePageHeader } from "@/components/tissue/tissue-page-header";
import { Button } from "@/components/ui/button";
import { tissueFaqs } from "@/lib/faq";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title: "FAQ | Tissue Blocks & Services | PathXDx",
  description:
    "Answers to common questions about ordering PathXDx tissue blocks, H&E images, ethical sourcing, slides, custom sourcing, and blocks from your own cells or animals.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
      <TissuePageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
        title="Common questions"
      >
        <p>
          Quick answers about tissue blocks and how we work. If your question
          isn&apos;t here, get in touch.
        </p>
      </TissuePageHeader>

      <div className="mt-12 max-w-3xl divide-y divide-border/70 rounded-2xl border border-border/80 bg-card">
        {tissueFaqs.map((faq) => (
          <details key={faq.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {faq.q}
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </p>
          </details>
        ))}
      </div>

      <Button asChild className="mt-10 font-semibold">
        <Link href="/contact">
          Ask us a question
          <ArrowRight className="ml-0.5" />
        </Link>
      </Button>
    </div>
  );
}
