"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/supabase/config";

const PENDING_EMAIL_KEY = "talent-tree:pending-auth-email";
const PENDING_AT_KEY = "talent-tree:pending-auth-at";
const PENDING_TTL_MS = 15 * 60 * 1000;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [phase, setPhase] = useState<"EMAIL" | "VERIFY">("EMAIL");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const demo = isDemoMode();

  useEffect(() => {
    if (demo) return;

    const pendingEmail = window.localStorage.getItem(PENDING_EMAIL_KEY);
    const pendingAt = Number(window.localStorage.getItem(PENDING_AT_KEY) || "0");

    if (pendingEmail && pendingAt && Date.now() - pendingAt < PENDING_TTL_MS) {
      setEmail(pendingEmail);
      rememberPending(email.trim());
      setPhase("VERIFY");
      setMessage(
        "A Talent Tree sign-in email was already sent. Use the current email or current verification code below. No new code has been sent."
      );
      return;
    }

    window.localStorage.removeItem(PENDING_EMAIL_KEY);
    window.localStorage.removeItem(PENDING_AT_KEY);
  }, [demo]);

  function rememberPending(address: string) {
    window.localStorage.setItem(PENDING_EMAIL_KEY, address);
    window.localStorage.setItem(PENDING_AT_KEY, String(Date.now()));
  }

  function clearPending() {
    window.localStorage.removeItem(PENDING_EMAIL_KEY);
    window.localStorage.removeItem(PENDING_AT_KEY);
  }

  async function sendSignIn(event: FormEvent) {
    event.preventDefault();

    if (demo) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=/`;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: callbackUrl,
        },
      });

      if (error) throw error;

      setPhase("VERIFY");
      setMessage(
        "Check your email. If it contains a Sign in link, click it. If it contains a verification code, enter the code below."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start sign-in.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();

    const cleanToken = token.replace(/\D/g, "").slice(0, 10);
    if (cleanToken.length < 6 || cleanToken.length > 10) {
      setMessage("Enter the verification code exactly as shown in your Talent Tree email.");
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

      clearPending();
      window.location.assign("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to verify this code.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (demo) return;

    setLoading(true);
    setMessage("");
    setToken("");

    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=/`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: callbackUrl,
        },
      });

      if (error) throw error;

      rememberPending(email.trim());
      setMessage(
        "A new sign-in email was sent. This replaces the previous code/link; use only the newest email."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resend sign-in email.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    clearPending();
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
          <form onSubmit={sendSignIn}>
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
              {demo ? "Open demo workspace" : loading ? "Sending…" : "Email me a sign-in"}
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

            <div className="login-option-note">
              If your email contains a <strong>Sign in</strong> link, use that link. It will return here through the secure callback and open the workspace.
            </div>

            <div className="login-divider"><span>or enter a code</span></div>

            <label htmlFor="token">Verification code</label>
            <input
              id="token"
              className="otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,10}"
              maxLength={10}
              value={token}
              onChange={(event) => setToken(event.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter code"
            />

            <button type="submit" disabled={loading || token.length < 6 || token.length > 10}>
              {loading ? "Verifying…" : "Verify code"}
            </button>

            <div className="login-option-note">
              Only request another email if you need one. Sending another email replaces the previous code/link.
            </div>

            <button type="button" className="secondary-login-button" disabled={loading} onClick={resend}>
              Send a new sign-in email
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
