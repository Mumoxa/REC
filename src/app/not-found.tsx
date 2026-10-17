import Link from "next/link";
export default function NotFound() {
  return (
    <main className="page-content">
      <div className="empty-state">
        <p className="eyebrow">Talent Tree Intelligence</p>
        <h1>Page not found</h1>
        <p>This address does not match a REC workspace page.</p>
        <Link className="btn btn-primary" href="/intelligence">
          Open intelligence
        </Link>
      </div>
    </main>
  );
}
