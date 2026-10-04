import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(process.cwd()),
  },
  async redirects() {
    return [
      {
        source: "/clinical-services",
        destination: "/areas-of-expertise",
        permanent: true,
      },
      {
        source: "/therapeutic-areas",
        destination: "/areas-of-expertise",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
