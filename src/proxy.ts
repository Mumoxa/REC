import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Public artwork is explicitly allowlisted in the gate. A filename suffix
  // must never bypass authentication for a workspace or future data route.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
