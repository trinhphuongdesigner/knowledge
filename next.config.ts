import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

const nextConfig: NextConfig = {
  reactCompiler: true,
  /**
   * Proxy trình xử lý đăng nhập của Firebase qua chính domain của site, để NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   * có thể trùng domain site (tránh chặn cookie bên thứ ba trên Safari/iOS PWA).
   */
  async rewrites() {
    if (!firebaseProjectId) return [];
    const origin = `https://${firebaseProjectId}.firebaseapp.com`;
    return [
      { source: "/__/auth/:path*", destination: `${origin}/__/auth/:path*` },
      { source: "/__/firebase/:path*", destination: `${origin}/__/firebase/:path*` },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Firebase nhúng /__/auth/iframe vào trang của chính site: chỉ cho phép cùng origin ở đây.
      { source: "/((?!__/).*)", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
      { source: "/__/:path*", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
