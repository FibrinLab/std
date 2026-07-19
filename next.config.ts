import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is for self-hosted Node (Render); Netlify's adapter manages its own output.
  output: process.env.NETLIFY ? undefined : "standalone",
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  poweredByHeader: false,
};

export default nextConfig;
