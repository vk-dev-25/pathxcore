import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PathXThemeProvider } from "@/components/pathx/pathx-theme-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PathXdx | Clinical & preclinical pathology",
    template: "%s | PathXdx",
  },
  description:
    "PathXdx provides clinical and preclinical pathology services—from accessioning and processing through staining, IHC, and pathologist evaluation.",
  metadataBase: new URL("https://pathxdx.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <PathXThemeProvider>{children}</PathXThemeProvider>
      </body>
    </html>
  );
}
