import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { requestOrigin, workspaceMembership } from "@/lib/auth/access";
import {
  PASSWORD_GRANT_COOKIE,
  passwordGrant,
  passwordGrantOptions,
} from "@/lib/auth/password-reset";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = requestOrigin(request);
  const failure = () => NextResponse.redirect(new URL("/login?error=link", origin));
  if (!hasSupabaseConfig()) return failure();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (!code && !(tokenHash && (type === "invite" || type === "recovery"))) return failure();
  try {
    const supabase = await createClient();
    const result = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: type as "invite" | "recovery",
        });
    if (result.error || !result.data.user?.email_confirmed_at || !result.data.session)
      return failure();
    const membership = await workspaceMembership(supabase, result.data.user.id);
    if (membership.error || !membership.data) {
      await supabase.auth.signOut({ scope: "local" });
      return failure();
    }
    // An email-verified one-time link grants password setup for this session only.
    const store = await cookies();
    store.set(
      PASSWORD_GRANT_COOKIE,
      passwordGrant(result.data.user.id, result.data.session.access_token),
      passwordGrantOptions
    );
    return NextResponse.redirect(new URL("/account/password", origin));
  } catch {
    return failure();
  }
}
