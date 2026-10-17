export function hasSupabaseConfig() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return Boolean(key && (url.protocol === "https:" || (local && url.protocol === "http:")));
  } catch {
    return false;
  }
}

/** Synthetic previews are an explicit local-development tool, never a hosted fallback. */
export function isDemoMode() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.VERCEL !== "1" &&
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}
