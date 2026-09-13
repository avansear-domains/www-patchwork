import type { NextConfig } from "next";

// Allow next/image to optimize images served from the R2 public URL.
const r2Host = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : undefined;

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    // CMS uploads go through a server action; allow big batches of photos.
    serverActions: { bodySizeLimit: "500mb" },
  },
  images: {
    remotePatterns: [
      ...(r2Host ? [{ protocol: "https" as const, hostname: r2Host }] : []),
      { protocol: "https", hostname: "i.scdn.co" }, // Spotify album art
    ],
  },
};

export default nextConfig;
