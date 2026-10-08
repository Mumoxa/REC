import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// The workspace is embedded in the sandbox/host preview iframe during local
// development, so framing must stay permitted there. Production stays locked
// down: DENY + frame-ancestors 'none'.
const contentSecurityPolicy = [
  "default-src 'self'",
  // React/Next only need eval in the development build.
  `script-src 'self' ${isProduction ? "'unsafe-inline'" : "'unsafe-inline' 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `frame-ancestors ${isProduction ? "'none'" : "*"}`,
].join("; ");

const securityHeaders = [
  ...(isProduction ? [{ key: "X-Frame-Options", value: "DENY" }] : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
