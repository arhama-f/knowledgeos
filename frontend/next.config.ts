import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" builds a self-contained server.js for Docker deployments.
  // On Vercel, omit it — Vercel manages its own build/runtime infrastructure.
  ...(process.env.DOCKER_BUILD === "true" && { output: "standalone" }),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      // Allow any HTTPS image for org logos (customer-hosted, arbitrary domains)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
