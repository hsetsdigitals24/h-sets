import type { NextConfig } from "next";

/** Allow next/image to optimise thumbnails served from the R2 public bucket. */
function r2RemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "https", hostname: "**.r2.dev" },
  ];
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (base) {
    try {
      const { hostname, protocol } = new URL(base);
      patterns.push({ protocol: protocol.replace(":", "") as "http" | "https", hostname });
    } catch {
      // Ignore a malformed base URL — the wildcard above still covers r2.dev hosts.
    }
  }
  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2RemotePatterns(),
  },
  async redirects() {
    return [
      {
        source: "/case-studies",
        destination: "/portfolio",
        permanent: true,
      },
      {
        source: "/case-studies/:slug",
        destination: "/portfolio/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
