export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function isDemoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !hasSupabaseConfig();
}
