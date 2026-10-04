"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/supabase/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [phase, setPhase] = useState<"EMAIL" | "OTP">("EMAIL");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const demo = isDemoMode();

  async function sendCode(event: FormEvent) {
    event.preventDefault();

    if (demo) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      setPhase("OTP");
      setMessage("A 6-digit sign-in code has been sent to your email.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send sign-in code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();

    const cleanToken = token.replace(/\D/g, "").slice(0, 6);
    if (cleanToken.length !== 6) {
      setMessage("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanToken,
        type: "email",
      });

      if (error) throw error;

      window.location.href = "/";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to verify this code.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (demo) return;

    setLoading(true);
    setMessage("");
    setToken("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;
      setMessage("A new 6-digit sign-in code has been sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resend sign-in code.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setPhase("EMAIL");
    setToken("");
    setMessage("");
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-mark login-mark">TT</div>
        <div className="eyebrow">Talent Tree</div>
        <h1>Recruitment Intelligence</h1>
        <p>Sign in to access the vacancy intelligence workspace.</p>

        {phase === "EMAIL" ? (
          <form onSubmit={sendCode}>
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
              {demo ? "Open demo workspace" : loading ? "Sending code…" : "Send sign-in code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <div className="otp-email-row">
              <span>{email}</span>
              <button type="button" className="link-button" onClick={restart} disabled={loading}>
                Change
              </button>
            </div>

            <label htmlFor="token">6-digit verification code</label>
            <input
              id="token"
              className="otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={token}
              onChange={(event) => setToken(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              autoFocus
            />

            <button type="submit" disabled={loading || token.length !== 6}>
              {loading ? "Verifying…" : "Sign in"}
            </button>

            <button type="button" className="secondary-login-button" disabled={loading} onClick={resendCode}>
              Send another code
            </button>
          </form>
        )}

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
