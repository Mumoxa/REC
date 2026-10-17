"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-shell">
      <div className="page-content">
        <section className="empty-state" role="alert">
          <ShieldAlert size={32} />
          <h1>Workspace unavailable</h1>
          <p>
            REC could not load your authorised records. Check your connection and workspace access,
            then try again.
          </p>
          <div className="page-actions">
            <button type="button" className="btn btn-primary" onClick={reset}>
              Try again
            </button>
            <Link prefetch={false} className="btn btn-secondary" href="/login">
              Check account access
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
