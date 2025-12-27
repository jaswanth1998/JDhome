import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Disable image optimization since it requires a server
  images: {
    unoptimized: true,
  },
  // Optional: Add basePath if deploying to a subpath (e.g., /jdhomes)
  // basePath: "/jdhomes",
  // Trailing slash for GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
