import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large file uploads for image detection
  serverExternalPackages: ["onnxruntime-node", "sharp"],
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
