import type { SupabaseClient } from "@supabase/supabase-js";

/** Membership is provisioned by an administrator, never by the sign-in form. */
export async function workspaceMembership(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("workspace_members")
    .select("workspace_id,workspaces!inner(slug)")
    .eq("user_id", userId)
    .eq("workspaces.slug", process.env.WORKSPACE_SLUG || "talent-tree")
    .limit(1)
    .maybeSingle();
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Use the HTTP destination Host; never trust an X-Forwarded-Host override. */
export function requestOrigin(request: Request): string {
  const target = new URL(request.url);
  const host = request.headers.get("host");
  if (!host || /[\s/@\\,#?]/.test(host)) return target.origin;
  try {
    return new URL(`${target.protocol}//${host}`).origin;
  } catch {
    return target.origin;
  }
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === requestOrigin(request);
  } catch {
    return false;
  }
}
