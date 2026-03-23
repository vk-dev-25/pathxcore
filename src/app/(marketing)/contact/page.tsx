import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact | PathXdx",
  description:
    "Contact PathXdx for clinical or preclinical pathology services. South San Francisco, CA.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Contact
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Contact us today
        </h1>
        <p className="mt-4 text-muted-foreground">
          We will get back to you as soon as we can. For secure client workflows
          and modules (LIMS, quote builder), use the client portal after signing
          in.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reach the team</CardTitle>
            <CardDescription>
              Telephone, email, and laboratory location.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Telephone</p>
                <a
                  href="tel:+16507971269"
                  className="text-muted-foreground hover:text-foreground"
                >
                  650-797-1269
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Email</p>
                <div className="flex flex-col gap-1 text-muted-foreground">
                  <a
                    href="mailto:info@pathxdx.com"
                    className="hover:text-foreground"
                  >
                    info@pathxdx.com
                  </a>
                  <a
                    href="mailto:nick@pathxdx.com"
                    className="hover:text-foreground"
                  >
                    nick@pathxdx.com
                  </a>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  Getting to our laboratory
                </p>
                <p className="text-muted-foreground">
                  South San Francisco, CA 94080
                </p>
              </div>
            </div>
            <div>
              <p className="font-medium text-foreground">Hours</p>
              <p className="text-muted-foreground">
                Monday–Friday: 7am–7pm · Saturday: 9am–5pm. You may also reach
                us outside these hours—we monitor messages regularly.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Client portal</CardTitle>
            <CardDescription>
              Signed-in access to PathX modules (LIMS, quote builder, and more).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For project intake tied to your account, sign in to the PathX
              workspace. New users receive access from your PathXdx
              administrator.
            </p>
            <Button asChild>
              <Link href="/pathx/sign-in">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
