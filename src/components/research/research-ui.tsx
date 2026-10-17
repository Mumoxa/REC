"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { formatSast } from "@/components/shell/app-header";

export function SearchField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="research-search">
      <Search size={17} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input
        className="field"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function RecordedTime({
  value,
  fallback = "Not recorded",
}: {
  value?: string | null;
  fallback?: string;
}) {
  return value ? (
    <time dateTime={value}>{formatSast(value)}</time>
  ) : (
    <span className="muted">{fallback}</span>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
  noun = "records",
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  noun?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="research-pagination">
      <span>
        {total
          ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`
          : "0"}{" "}
        {noun}
      </span>
      <nav aria-label={`${noun} pagination`}>
        <button
          className="btn btn-secondary"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          className="btn btn-secondary"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
