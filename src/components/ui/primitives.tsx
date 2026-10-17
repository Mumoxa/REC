"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X, ArrowUpRight, SearchX } from "lucide-react";

export function humanise(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function Badge({ value }: { value: string }) {
  const tone = /FAIL|BLOCKED|CONFLICT|EXCLUDED/.test(value)
    ? "danger"
    : /WITH_UNKNOWNS|HYPOTHESIS|PARTIAL|IN_PROGRESS|PATTERN_INFERRED/.test(value)
      ? "warning"
      : /PROBABLE/.test(value)
        ? "info"
        : /CONFIRMED|VERIFIED|PASS|COMPLETE|READY|AGREED_CLIENT/.test(value)
          ? "success"
          : "neutral";
  return (
    <span className={`badge badge-${tone}`} data-status={value}>
      {humanise(value)}
    </span>
  );
}

export function PageHeader({
  eyebrow = "Talent Tree Intelligence",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  href,
  icon,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  href?: string;
  icon?: ReactNode;
}) {
  const content = (
    <>
      <div className="stat-card-top">
        <span className="stat-icon">{icon}</span>
        {href && <ArrowUpRight size={16} aria-hidden="true" />}
      </div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {detail && <span className="stat-detail">{detail}</span>}
    </>
  );
  return href ? (
    <Link prefetch={false} className="stat-card surface" href={href}>
      {content}
    </Link>
  ) : (
    <div className="stat-card surface">{content}</div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <SearchX size={28} aria-hidden="true" />
      <h3>{title}</h3>
      {children && <div>{children}</div>}
    </div>
  );
}

/** Modal primitive shared by navigation, record intelligence and confirmations. */
export function Dialog({
  title,
  onClose,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const panel = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = panel.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(
        element?.querySelectorAll<HTMLElement>(
          'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]'
        ) ?? []
      ).filter((node) => !node.hidden && node.getAttribute("aria-hidden") !== "true");
    (
      element?.querySelector<HTMLElement>("[data-autofocus]") ??
      focusables()[0] ??
      element
    )?.focus();
    function onKey(event: KeyboardEvent) {
      // Only the uppermost dialog handles Escape or traps focus.
      const dialogs = document.querySelectorAll('[aria-modal="true"]');
      if (dialogs[dialogs.length - 1] !== element) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      }
      if (event.key === "Tab") {
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (!first) {
          event.preventDefault();
          element?.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === element)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className={`dialog-panel ${className}`}
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
      >
        <div className="dialog-header">
          <h2 id={id}>{title}</h2>
          <button
            className="icon-button"
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="dialog-body">{children}</div>
      </section>
    </div>
  );
}
