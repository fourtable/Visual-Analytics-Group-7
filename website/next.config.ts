import type { NextConfig } from "next";

// One static page: `next build` writes plain HTML/CSS/JS to out/,
// which Vercel (or any static host) serves as is.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
