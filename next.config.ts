import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(process.cwd()),
  },
  async redirects() {
    return [
      // Old single-page Tissue Blocks links (before the split into pages).
      {
        source: "/tissue-bank",
        has: [{ type: "query", key: "type", value: "cell" }],
        destination: "/tissue-bank/cell-pellets",
        permanent: true,
      },
      {
        source: "/tissue-bank",
        has: [{ type: "query", key: "system" }],
        destination: "/tissue-bank/human-ffpe",
        permanent: true,
      },
      {
        source: "/clinical-services",
        destination: "/preclinical-services",
        permanent: true,
      },
      {
        source: "/therapeutic-areas",
        destination: "/preclinical-services",
        permanent: true,
      },
      // Areas of expertise was merged into the Services page.
      {
        source: "/areas-of-expertise",
        destination: "/preclinical-services#expertise",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
