import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  adapterPath: path.resolve(__dirname, "./vercel-adapter.js"),
};

export default nextConfig;
