"use client";

import { FormEvent, useEffect, useState } from "react";
import { ShieldCheck, BriefcaseBusiness, Users, Building2 } from "lucide-react";
import "../login.css";
import { TalentTreeLogo } from "@/components/ui/talent-tree-logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recover, setRecover] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code) {
      setError(true);
      setMessage(
        code === "access"
          ? "This account does not have workspace access. Contact your administrator."
          : code === "unavailable"
            ? "Sign-in is temporarily unavailable. Contact your administrator."
            : "The password setup link could not be verified. Request a new link."
      );
    }
    // Remove email-only state left by the retired OTP interface.
    try {
      window.localStorage.removeItem("talent-tree:pending-auth-email");
      window.localStorage.removeItem("talent-tree:pending-auth-at");
    } catch {
      /* Browser storage is optional. */
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch(recover ? "/api/auth/recover" : "/api/auth/sign-in", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recover ? { email: email.trim() } : { email: email.trim(), password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in. Please try again.");
      if (recover)
        setMessage(
          "If this email has access, a password reset link will arrive shortly. Open it in this browser."
        );
      else window.location.replace("/");
    } catch (problem) {
      setError(true);
      setMessage(
        problem instanceof Error ? problem.message : "Unable to sign in. Please try again."
      );
    } finally {
      setPassword("");
      setLoading(false);
    }
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
          <h1>{recover ? "Reset your password" : "Sign in to REC"}</h1>
          <p className="login-lede">
            {recover
              ? "Enter your work email to request a password setup or reset link."
              : "Use your Talent Tree work email and password."}
          </p>
          <form className="login-form" onSubmit={submit}>
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              maxLength={320}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.co.za"
            />
            {!recover && (
              <>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={128}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </>
            )}
            <button type="submit" disabled={loading}>
              {loading
                ? recover
                  ? "Sending…"
                  : "Signing in…"
                : recover
                  ? "Send reset link"
                  : "Sign in"}
            </button>
            <button
              type="button"
              className="link-button"
              disabled={loading}
              onClick={() => {
                setRecover(!recover);
                setMessage("");
                setPassword("");
              }}
            >
              {recover ? "Back to sign in" : "Forgot password?"}
            </button>
          </form>
          {message && (
            <div
              className={`login-message ${error ? "error" : ""}`}
              role={error ? "alert" : "status"}
            >
              {message}
            </div>
          )}
          <p className="demo-note">
            Invited workspace members only. Contact your administrator for access.
          </p>
        </div>
      </section>
    </main>
  );
}
