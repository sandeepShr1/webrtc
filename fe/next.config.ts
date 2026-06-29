import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.5', '192.168.1.*', '*.192.168.1.5', "169.254.46.82"],

};

export default nextConfig;
