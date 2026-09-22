import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000","*.devtunnels.ms"],
    },
  },
};

export default nextConfig;
