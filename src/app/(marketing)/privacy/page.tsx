import type { Metadata } from "next";

import { TissuePageHeader } from "@/components/tissue/tissue-page-header";
import { SITE_EMAIL_PRIMARY } from "@/lib/site-identity";
import { marketingMetadata } from "@/lib/site-seo";

export const metadata: Metadata = marketingMetadata({
  title: "Privacy Policy | PathXDx",
  description:
    "How PathXDx handles information you share through this website, including contact and enquiry forms.",
  path: "/privacy",
});

const LAST_UPDATED = "October 5, 2026";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "What we collect",
    body: (
      <>
        <p>
          When you use our contact or enquiry forms, we receive the email
          address, inquiry type, and message you enter, including any items you
          added to an enquiry. We do not ask for or need patient or personal
          health information through this website.
        </p>
        <p>
          If you are a client and sign in to the client workspace, we use
          cookies that are necessary to keep you signed in.
        </p>
      </>
    ),
  },
  {
    title: "How we use it",
    body: (
      <p>
        We use the information you send to reply to your enquiry, prepare
        proposals and quotes, and provide the services you request. We do not
        sell your information or use it for third-party advertising.
      </p>
    ),
  },
  {
    title: "How it is delivered",
    body: (
      <p>
        Messages from our forms are delivered to our team by email through an
        email service provider. They are kept only as long as needed to handle
        your enquiry and any resulting work, or as required for our business
        records.
      </p>
    ),
  },
  {
    title: "Cookies and browser storage",
    body: (
      <p>
        This website does not use analytics or advertising cookies. Your browser
        stores your light or dark theme choice, and the items in your enquiry
        list for the current browser session, so they persist as you move
        between pages. These stay in your browser until you send an enquiry.
      </p>
    ),
  },
  {
    title: "Your choices",
    body: (
      <p>
        You can ask us what information we hold about you, or ask us to correct
        or delete it, by emailing{" "}
        <a
          href={`mailto:${SITE_EMAIL_PRIMARY}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          {SITE_EMAIL_PRIMARY}
        </a>
        .
      </p>
    ),
  },
  {
    title: "Changes",
    body: (
      <p>
        We may update this policy from time to time. The date below shows when
        it was last changed.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
      <TissuePageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
        title="Privacy policy"
      >
        <p>
          How PathXDx handles the information you share through this website.
        </p>
      </TissuePageHeader>

      <div className="mt-12 max-w-3xl space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-tight">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
              {section.body}
            </div>
          </section>
        ))}
        <p className="text-sm text-muted-foreground">
          Last updated {LAST_UPDATED}.
        </p>
      </div>
    </div>
  );
}
