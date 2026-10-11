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
    default: "PathXdx | Preclinical pathology & histology",
    template: "%s | PathXdx",
  },
  description:
    "PathXdx provides preclinical pathology and histology services for biotech, pharma, and research teams, from accessioning and processing through staining, IHC, and pathologist evaluation.",
  metadataBase: new URL("https://pathxdx.com"),
  icons: {
    icon: [
      { url: "/images/pathxdx-icon.svg", type: "image/svg+xml" },
      { url: "/images/pathxdx-icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/images/apple-touch-icon.png", sizes: "180x180" }],
  },
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
