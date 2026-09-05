import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Vercel's serverless functions hard-cap request bodies at ~4.5MB
      // regardless of this setting — keep it at/under that so a rejected
      // upload fails the same way in local dev as it does in production.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
