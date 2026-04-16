import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(process.cwd()),
  },
  /**
   * `/tissue-bank` is DB-heavy; temporarily send traffic to the standalone site.
   * Remove this redirect when re-enabling the in-app page at
   * `src/app/(marketing)/tissue-bank/page.tsx`.
   */
  async redirects() {
    return [
      {
        source: "/tissue-bank",
        destination: "https://tissuesxdx.com",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
