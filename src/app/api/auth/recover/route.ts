import { requestOrigin } from "@/lib/auth/access";
import { hasPasswordResetKey } from "@/lib/auth/password-reset";
import { createClient } from "@/lib/supabase/server";
import { authJson, authRequestError, validEmail } from "@/lib/auth/http";
import { readJsonBody } from "@/lib/ops/validation";

export async function POST(request: Request) {
  const invalid = authRequestError(request);
  if (invalid) return invalid;
  if (!hasPasswordResetKey())
    return authJson({ error: "Password recovery is temporarily unavailable." }, 503);
  const body = (await readJsonBody(request, 2048)) as Record<string, unknown> | null;
  if (!validEmail(body?.email)) return authJson({ error: "Enter a valid work email." }, 400);
  try {
    const supabase = await createClient();
    // Provider failures and unknown addresses get the same non-enumerating response.
    await supabase.auth.resetPasswordForEmail(body.email.trim(), {
      redirectTo: new URL("/auth/callback?next=/account/password", requestOrigin(request)).href,
    });
  } catch {
    /* Do not expose whether an address exists or delivery was attempted. */
  }
  return authJson({ ok: true });
}
