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
  // LiveKit's <VideoConference> (via @livekit/components-core's
  // useVisualStableUpdate) crashes under React 19 StrictMode's dev double-render
  // with "Element not part of the array" when a camera placeholder track flips
  // to a real track between the two renders. StrictMode is a dev-only aid, so
  // disabling it has no effect on production behaviour. Revisit if the LiveKit
  // components add StrictMode support.
  reactStrictMode: false,
  images: {
    remotePatterns: r2RemotePatterns(),
    // The industry-tile placeholders in /public/industries are SVGs. next/image
    // blocks SVG by default; these are our own trusted files, and the strict CSP
    // + sandbox neutralise any script/interaction if one is ever swapped in.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
