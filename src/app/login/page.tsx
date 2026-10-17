"use client";

import { FormEvent, useEffect, useState } from "react";
import { ShieldCheck, BriefcaseBusiness, Users, Building2 } from "lucide-react";
import "../login.css";
import { TalentTreeLogo } from "@/components/ui/talent-tree-logo";
import { isDemoMode } from "@/lib/supabase/config";

const PENDING_EMAIL_KEY = "talent-tree:pending-auth-email";
const PENDING_AT_KEY = "talent-tree:pending-auth-at";
const PENDING_TTL_MS = 15 * 60 * 1000;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [phase, setPhase] = useState<"EMAIL" | "VERIFY">("EMAIL");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "error">("info");
  const [loading, setLoading] = useState(false);
  const demo = isDemoMode();

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("error");
    if (authError === "missing_code") {
      setMessageTone("error");
      setMessage(
        "The sign-in link was incomplete. Request a new email and use the newest link or code."
      );
    } else if (authError === "auth_exchange") {
      setMessageTone("error");
      setMessage(
        "That sign-in link could not be verified. It may have expired. Request a new email."
      );
    }

    if (demo) return;

    const pendingEmail = window.localStorage.getItem(PENDING_EMAIL_KEY);
    const pendingAt = Number(window.localStorage.getItem(PENDING_AT_KEY) || "0");

    if (pendingEmail && pendingAt && Date.now() - pendingAt < PENDING_TTL_MS) {
      setEmail(pendingEmail);
      setPhase("VERIFY");
      setMessageTone("info");
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

  function fail(text: string) {
    setMessageTone("error");
    setMessage(text);
  }

  function info(text: string) {
    setMessageTone("info");
    setMessage(text);
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
      const { createClient } = await import("@/lib/supabase/client");
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
      setPhase("VERIFY");
      info(
        "Check your email. If it contains a Sign in link, click it. If it contains a verification code, enter the code below."
      );
    } catch (error) {
      fail(error instanceof Error ? error.message : "Unable to start sign-in.");
    } finally {
      setLoading(false);
    }
  }

  function useExistingCode() {
    const address = email.trim();
    if (!address) {
      fail("Enter your work email first, then choose I already have a code.");
      return;
    }

    setEmail(address);
    rememberPending(address);
    setPhase("VERIFY");
    info(
      "Enter the current verification code from your existing Talent Tree email. No new email has been sent."
    );
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();

    const cleanToken = token.replace(/\D/g, "").slice(0, 10);
    if (cleanToken.length < 6 || cleanToken.length > 10) {
      fail("Enter the verification code exactly as shown in your Talent Tree email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { createClient } = await import("@/lib/supabase/client");
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
      fail(error instanceof Error ? error.message : "Unable to verify this code.");
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
      const { createClient } = await import("@/lib/supabase/client");
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
      info(
        "A new sign-in email was sent. This replaces the previous code/link; use only the newest email."
      );
    } catch (error) {
      fail(error instanceof Error ? error.message : "Unable to resend sign-in email.");
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
    <main className="login-page" id="main-content">
      <section className="login-visual" aria-label="Talent Tree Recruitment Intelligence">
        <div className="login-orbit" aria-hidden="true">
          <span />
          <span />
          <TalentTreeLogo decorative />
        </div>

        <div className="login-brand">
          <span className="brand-mark">
            <TalentTreeLogo />
          </span>
          <span className="login-brand-lockup">
            <span className="login-brand-name">Talent Tree</span>
            <span className="login-brand-sub">Recruitment Intelligence</span>
          </span>
        </div>

        <div className="login-value">
          <h2>
            Every opportunity. <span>Connected to intelligence.</span>
          </h2>
          <p>
            One workspace for vacancies, hiring stakeholders, candidate markets and the evidence
            behind each decision.
          </p>
        </div>

        <div className="login-principles">
          <span>
            <Building2 size={18} />
            Employer intelligence
          </span>
          <span>
            <BriefcaseBusiness size={18} />
            Connected opportunities
          </span>
          <span>
            <Users size={18} />
            Evidence-backed markets
          </span>
          <span>
            <ShieldCheck size={18} />
            Independent research QA
          </span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <div className="eyebrow">Secure access</div>
          <h1>Sign in to REC</h1>
          <p className="login-lede">
            {phase === "EMAIL"
              ? "Use your Talent Tree work email. We will send a sign-in link or a one-time code."
              : "Finish signing in with the link or the one-time code from your Talent Tree email."}
          </p>

          {phase === "EMAIL" ? (
            <form className="login-form" onSubmit={sendSignIn}>
              <label htmlFor="email">Work email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required={!demo}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.co.za"
                aria-describedby="email-help"
              />
              <span id="email-help" className="sr-only">
                Use the email address registered for your Talent Tree workspace access.
              </span>
              <button type="submit" disabled={loading}>
                {demo ? "Open demo workspace" : loading ? "Sending…" : "Email me a sign-in"}
              </button>

              {!demo && (
                <button
                  type="button"
                  className="secondary-login-button"
                  disabled={loading}
                  onClick={useExistingCode}
                >
                  I already have a code
                </button>
              )}
            </form>
          ) : (
            <form className="login-form" onSubmit={verifyCode}>
              <div className="otp-email-row">
                <span>{email}</span>
                <button type="button" className="link-button" onClick={restart} disabled={loading}>
                  Change
                </button>
              </div>

              <div className="login-option-note">
                If your email contains a <strong>Sign in</strong> link, use that link. It returns
                here through the secure callback and opens the workspace.
              </div>

              <div className="login-divider">
                <span>or enter a code</span>
              </div>

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
                aria-describedby="token-help"
              />
              <span id="token-help" className="sr-only">
                Enter the 6 to 10 digit code from your most recent Talent Tree sign-in email.
              </span>

              <button type="submit" disabled={loading || token.length < 6 || token.length > 10}>
                {loading ? "Verifying…" : "Verify code"}
              </button>

              <div className="login-option-note">
                Only request another email if you need one. Sending another email replaces the
                previous code or link.
              </div>

              <button
                type="button"
                className="secondary-login-button"
                disabled={loading}
                onClick={resend}
              >
                Send a new sign-in email
              </button>
            </form>
          )}

          <div
            className={`login-message ${messageTone === "error" ? "error" : ""}`}
            role={messageTone === "error" ? "alert" : "status"}
            aria-live={messageTone === "error" ? "assertive" : "polite"}
            hidden={!message}
          >
            {message}
          </div>

          {demo && (
            <div className="demo-note">
              This demonstration uses synthetic records. Recruiter actions are temporary and do not
              change live REC data.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
