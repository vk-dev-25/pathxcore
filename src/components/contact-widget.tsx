"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { ContactUsForm } from "@/components/contact-us-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ContactWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  if (pathname === "/contact") {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <Button
          type="button"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => {
            setFormKey((k) => k + 1);
            setOpen(true);
          }}
          aria-label="Open contact form"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact us</DialogTitle>
          </DialogHeader>
          <ContactUsForm key={formKey} variant="dialog" />
        </DialogContent>
      </Dialog>
    </>
  );
}
