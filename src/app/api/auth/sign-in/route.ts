import { createClient } from "@/lib/supabase/server";
import { workspaceMembership } from "@/lib/auth/access";
import { authJson, authRequestError, validEmail } from "@/lib/auth/http";
import { readJsonBody } from "@/lib/ops/validation";

const denied = () =>
  authJson({ error: "Unable to sign in. Check your credentials and workspace access." }, 401);
export async function POST(request: Request) {
  const invalid = authRequestError(request);
  if (invalid) return invalid;
  const body = (await readJsonBody(request, 4096)) as Record<string, unknown> | null;
  if (
    !validEmail(body?.email) ||
    typeof body?.password !== "string" ||
    !body.password ||
    body.password.length > 128
  )
    return denied();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email.trim(),
      password: body.password,
    });
    if (error || !data.user?.email_confirmed_at) {
      if (error?.status === 429) {
        const response = authJson({ error: "Too many sign-in attempts. Try again shortly." }, 429);
        response.headers.set("Retry-After", "60");
        return response;
      }
      return denied();
    }
    const membership = await workspaceMembership(supabase, data.user.id);
    if (membership.error || !membership.data) {
      await supabase.auth.signOut({ scope: "local" });
      return denied();
    }
    // Session and refresh credentials stay in HttpOnly cookies, never JSON or browser storage.
    return authJson({ ok: true });
  } catch {
    return authJson({ error: "Sign-in is temporarily unavailable." }, 503);
  }
}
