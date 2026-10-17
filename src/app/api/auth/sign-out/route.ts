import { createClient } from "@/lib/supabase/server";
import { authJson, authRequestError } from "@/lib/auth/http";

export async function POST(request: Request) {
  const invalid = authRequestError(request);
  if (invalid) return invalid;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return authJson({ error: "Unable to sign out. Please try again." }, 503);
    const response = authJson({ ok: true });
    response.headers.set("Clear-Site-Data", '"cache", "storage"');
    return response;
  } catch {
    return authJson({ error: "Unable to sign out. Please try again." }, 503);
  }
}
