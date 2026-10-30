import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Browser meminta /favicon.ico secara otomatis; arahkan ke favicon dari Pengaturan.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/site-icon" }];
  },
  experimental: {
    // Upload logo (maks. 2 MB) & gambar slider (maks. 5 MB) lewat server action; sisakan ruang untuk overhead multipart.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
