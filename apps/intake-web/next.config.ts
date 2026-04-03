import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /api/session/* to the session-api service
  async rewrites() {
    return [
      {
        source: "/api/intake/:path*",
        destination: `${process.env.SESSION_API_URL ?? "http://localhost:3001"}/api/intake/:path*`,
      },
    ];
  },
};

export default nextConfig;
