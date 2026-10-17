"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

export function SessionControls() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", restore);
    const channel =
      typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("rec-session") : null;
    if (channel)
      channel.onmessage = (event) => {
        if (event.data === "signed-out") window.location.replace("/login");
      };
    return () => {
      window.removeEventListener("pageshow", restore);
      channel?.close();
    };
  }, []);
  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error("Unable to sign out. Try again.");
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("rec-session");
        channel.postMessage("signed-out");
        channel.close();
      }
      window.location.replace("/login");
    } catch {
      setError("Unable to sign out. Try again.");
      setBusy(false);
    }
  }
  return (
    <div className="session-controls">
      <button
        type="button"
        className="icon-button"
        aria-label="Sign out"
        title="Sign out"
        disabled={busy}
        onClick={signOut}
      >
        <LogOut size={18} aria-hidden="true" />
      </button>
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
