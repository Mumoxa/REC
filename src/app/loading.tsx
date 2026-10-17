export default function Loading() {
  return (
    <main className="page-shell">
      <div className="page-content" role="status" aria-label="Loading workspace">
        <p className="eyebrow">Talent Tree Intelligence</p>
        <h1>Loading intelligence</h1>
        <div className="stat-grid">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
        <div className="skeleton" style={{ minHeight: 360 }} />
        <span className="sr-only">Fetching authorised workspace records.</span>
      </div>
    </main>
  );
}
