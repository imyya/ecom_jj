import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000","*.devtunnels.ms"],
    },
    
  },
  images: {
    remotePatterns: [new URL(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/**`)],
  },
};

export default nextConfig;
