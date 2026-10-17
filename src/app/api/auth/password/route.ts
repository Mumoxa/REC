import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { workspaceMembership } from "@/lib/auth/access";
import { authJson, authRequestError } from "@/lib/auth/http";
import {
  PASSWORD_GRANT_COOKIE,
  passwordGrantOptions,
  validPasswordGrant,
} from "@/lib/auth/password-reset";
import { readJsonBody } from "@/lib/ops/validation";

export async function POST(request: Request) {
  const invalid = authRequestError(request);
  if (invalid) return invalid;
  const body = (await readJsonBody(request, 2048)) as Record<string, unknown> | null;
  if (typeof body?.password !== "string" || body.password.length < 12 || body.password.length > 128)
    return authJson({ error: "Use a password between 12 and 128 characters." }, 400);
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user?.email_confirmed_at) return authJson({ error: "Unauthorized" }, 401);
    const membership = await workspaceMembership(supabase, user.id);
    if (membership.error || !membership.data)
      return authJson({ error: "Workspace access is not permitted." }, 403);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const store = await cookies();
    if (
      !session ||
      !validPasswordGrant(store.get(PASSWORD_GRANT_COOKIE)?.value, user.id, session.access_token)
    )
      return authJson(
        { error: "Request a new password reset link and open it in this browser." },
        403
      );
    const changed = await supabase.auth.updateUser({ password: body.password });
    if (changed.error)
      return authJson(
        { error: "Unable to update the password. Try a different password or request a new link." },
        400
      );
    store.set(PASSWORD_GRANT_COOKIE, "", { ...passwordGrantOptions, maxAge: 0 });
    const signedOut = await supabase.auth.signOut({ scope: "global" });
    if (signedOut.error)
      return authJson({ error: "Password updated. Please sign out before signing in again." }, 503);
    return authJson({ ok: true });
  } catch {
    return authJson({ error: "Password update is temporarily unavailable." }, 503);
  }
}
