import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfig, isDemoMode } from "./config";
import {
  requestOrigin,
  sameOrigin,
  sessionCookieOptions,
  workspaceMembership,
} from "@/lib/auth/access";

const PUBLIC_PATHS = new Set([
  "/login",
  "/auth/callback",
  "/api/auth/sign-in",
  "/api/auth/recover",
  "/api/auth/sign-out",
  // This service endpoint independently requires the existing ingestion bearer key.
  "/api/ingest/run",
  "/robots.txt",
  "/favicon.ico",
  "/favicon-32.png",
  "/talent-tree-logo.png",
  "/talent-tree-logo-2026.png",
]);
const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protect = (response: NextResponse) => {
    Object.entries(privateHeaders).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  };
  if (PUBLIC_PATHS.has(pathname)) return protect(NextResponse.next({ request }));

  // Explicit local synthetic preview only. Production always requires authentication.
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(requestOrigin(request)).hostname
  );
  if (isDemoMode() && loopback) return protect(NextResponse.next({ request }));

  let response = NextResponse.next({ request });
  const deny = (status: number, message: string) => {
    const withCookies = (denied: NextResponse) => {
      response.cookies.getAll().forEach((cookie) => denied.cookies.set(cookie));
      return protect(denied);
    };
    if (pathname.startsWith("/api/"))
      return withCookies(NextResponse.json({ error: message }, { status }));
    const url = new URL("/login", requestOrigin(request));
    if (status === 503) url.searchParams.set("error", "unavailable");
    if (status === 403) url.searchParams.set("error", "access");
    return withCookies(NextResponse.redirect(url));
  };
  if (!hasSupabaseConfig()) return deny(503, "Sign-in is unavailable.");
  if (
    pathname.startsWith("/api/") &&
    !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
    !sameOrigin(request)
  )
    return deny(403, "Request origin is not permitted.");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: sessionCookieOptions,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, ...sessionCookieOptions })
          );
          if (headers)
            Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    }
  );
  try {
    // Validate with Auth rather than trusting a cookie-supplied session object.
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.id || !data.user.email_confirmed_at) return deny(401, "Unauthorized");
    const membership = await workspaceMembership(supabase, data.user.id);
    if (membership.error) return deny(503, "Workspace access is unavailable.");
    if (!membership.data) return deny(403, "Workspace access is not permitted.");
    return protect(response);
  } catch {
    return deny(503, "Sign-in is unavailable.");
  }
}
