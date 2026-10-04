"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/supabase/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const demo = isDemoMode();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (demo) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setMessage("Check your email for the secure sign-in link.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-mark login-mark">TT</div>
        <div className="eyebrow">Talent Tree</div>
        <h1>Recruitment Intelligence</h1>
        <p>Sign in to access the vacancy intelligence workspace.</p>

        <form onSubmit={submit}>
          <label htmlFor="email">Work email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.co.za"
          />
          <button type="submit" disabled={loading}>
            {demo ? "Open demo workspace" : loading ? "Sending link…" : "Send magic link"}
          </button>
        </form>

        {message && <div className="login-message">{message}</div>}
        {demo && (
          <div className="demo-note">
            Demo mode is enabled. Live authentication activates automatically when Supabase environment variables are configured.
          </div>
        )}
      </section>
    </main>
  );
}
