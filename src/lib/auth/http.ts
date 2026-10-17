import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { sameOrigin } from "./access";

export function authJson(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
export function authRequestError(request: Request) {
  if (!sameOrigin(request)) return authJson({ error: "Request origin is not permitted." }, 403);
  if (!hasSupabaseConfig()) return authJson({ error: "Sign-in is temporarily unavailable." }, 503);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return authJson({ error: "A JSON request is required." }, 415);
  return null;
}
export function validEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length <= 320 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}
