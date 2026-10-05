import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This checkout lives inside another copy of the app. Keep deployment
  // tracing and bundling rooted here rather than inheriting its lockfile.
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  // Allow phones/other devices on the LAN to load the Next.js dev resources
  // (/_next/* chunks + HMR) when hitting the dev server by LAN IP. Without this,
  // Next 16 blocks those as cross-origin and the client JS never runs — the page
  // renders only its background and all motion content stays at opacity:0.
  allowedDevOrigins: ["192.168.0.101", "192.168.0.102"],
};

export default nextConfig;
