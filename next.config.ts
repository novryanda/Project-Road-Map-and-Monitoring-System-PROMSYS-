import "./src/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/project-management/project",
        permanent: false,
      },
    ];
  },
  // Rewrites are now handled at the infrastructure level (Dokploy/Traefik)
  // so that both FE and BE share the same domain and cookies.
};

export default nextConfig;
