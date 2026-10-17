"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  CircleAlert,
  ExternalLink,
  FileCheck2,
  LoaderCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Badge, Dialog } from "@/components/ui/primitives";
import type { CandidateAssignment, EvidenceStatus } from "@/lib/data/types";
import { CANDIDATE_OPERATIONAL_STATUSES, validateCandidateOperation } from "@/lib/ops/validation";
import {
  canChangeWorkflow,
  candidateDate,
  candidateLabel,
  publicProfileUrl,
  workflowLabel,
  type CandidateIdentity,
} from "./market-model";

const EVIDENCE_GROUPS: { status: EvidenceStatus; title: string }[] = [
  { status: "CONFIRMED", title: "Confirmed claims" },
  { status: "PROBABLE", title: "Probable claims" },
  { status: "HYPOTHESIS", title: "Hypotheses" },
  { status: "UNKNOWN", title: "Unknown claims" },
];

type CandidateOperation = Pick<CandidateAssignment, "operationalStatus" | "excludedReason">;

export function CandidateIntelligence({
  person,
  initialVacancyId,
  demoMode,
  onClose,
  onSaved,
}: {
  person: CandidateIdentity;
  initialVacancyId: string;
  demoMode: boolean;
  onClose: () => void;
  onSaved: (vacancyId: string, candidateId: string, operation: CandidateOperation) => void;
}) {
  const [vacancyId, setVacancyId] = useState(initialVacancyId);
  const [targets, setTargets] = useState<Record<string, CandidateAssignment["operationalStatus"]>>(
    {}
  );
  const [excluding, setExcluding] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const reasonInput = useRef<HTMLTextAreaElement>(null);
  const workflowInput = useRef<HTMLSelectElement>(null);
  const wasExcluding = useRef(false);
  const { candidate, vacancy } =
    person.assignments.find((link) => link.vacancy.id === vacancyId) ?? person.assignments[0];
  const target = targets[vacancy.id] ?? candidate.operationalStatus;
  const profileUrl = publicProfileUrl(candidate.profileUrl);

  useEffect(() => {
    if (excluding) reasonInput.current?.focus();
    else if (wasExcluding.current) workflowInput.current?.focus();
    wasExcluding.current = excluding;
  }, [excluding]);

  async function save(status: CandidateAssignment["operationalStatus"], exclusionReason?: string) {
    const payload = {
      vacancyId: vacancy.id,
      candidateId: candidate.candidateId,
      operationalStatus: status,
      ...(status === "EXCLUDED" ? { reason: exclusionReason } : {}),
    };
    const validation = validateCandidateOperation(payload);
    setSuccess("");
    setError("");
    if (!canChangeWorkflow(candidate.operationalStatus, status)) {
      setError(
        "Earlier workflow stages are unavailable after progression. Restore excluded candidates to Relevant before progressing them."
      );
      return;
    }
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setPending(true);
    try {
      if (!demoMode) {
        const response = await fetch("/api/ops/candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body: { ok?: boolean; error?: string } = await response.json();
        if (!response.ok || !body.ok)
          throw new Error(
            body.error || "The candidate workflow could not be saved. Please try again."
          );
      }
      onSaved(vacancy.id, candidate.candidateId, {
        operationalStatus: validation.value.operationalStatus,
        excludedReason: validation.value.excludedReason,
      });
      setTargets((current) => ({ ...current, [vacancy.id]: status }));
      setExcluding(false);
      setReason("");
      setSuccess(
        `${demoMode ? "Demo change saved locally" : "Workflow saved"}: ${workflowLabel(status)} for ${vacancy.title}.`
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "The candidate workflow could not be saved. Please try again."
      );
    } finally {
      setPending(false);
    }
  }

  function close() {
    if (pending) return;
    if (excluding) {
      setExcluding(false);
      setError("");
    } else onClose();
  }

  return (
    <Dialog
      title={excluding ? "Exclude candidate confirmation" : "Candidate intelligence"}
      onClose={close}
      className="candidate-dialog"
    >
      <div className="candidate-detail">
        {excluding ? (
          <div className="candidate-exclusion">
            <div className="candidate-exclusion-icon">
              <CircleAlert size={26} aria-hidden="true" />
            </div>
            <h3>Exclude {candidate.name} from this vacancy?</h3>
            <p>
              This updates the recruiter workflow for <strong>{vacancy.title}</strong>. Research
              bucket, evidence, QA and other vacancy assignments remain independent.
            </p>
            <label className="field">
              <span>Reason for exclusion</span>
              <textarea
                ref={reasonInput}
                aria-label="Reason for exclusion"
                value={reason}
                maxLength={500}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Record the reason for this recruiter decision…"
                rows={4}
                disabled={pending}
              />
            </label>
            <p className="muted">
              {demoMode
                ? "Demo workspace: this local page change resets on reload."
                : "This reason is saved on the vacancy-specific recruiter operation."}
            </p>
            {error && (
              <div role="alert" className="candidate-feedback candidate-feedback-error">
                {error}
              </div>
            )}
            <div className="candidate-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={pending}
                onClick={() => {
                  setExcluding(false);
                  setError("");
                }}
              >
                Cancel exclusion
              </button>
              <button
                type="button"
                className="btn candidate-danger"
                disabled={pending || !reason.trim()}
                onClick={() => void save("EXCLUDED", reason)}
              >
                {pending ? <LoaderCircle className="candidate-spinner" size={16} /> : null}
                {pending ? "Saving exclusion…" : "Confirm exclusion"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="candidate-detail-hero">
              <div className="candidate-detail-hero-icon">
                <UsersIcon name={candidate.name} />
              </div>
              <div>
                <span className="candidate-detail-eyebrow">Evidence-backed talent profile</span>
                <h3>{candidate.name}</h3>
                <p>{candidate.currentTitle || "Title not recorded"}</p>
                <div className="candidate-detail-identity">
                  <span>
                    <Building2 size={14} aria-hidden="true" />
                    {candidate.currentEmployer || "Employer not recorded"}
                  </span>
                  <span>
                    <MapPin size={14} aria-hidden="true" />
                    {candidate.location || "Location not recorded"}
                  </span>
                </div>
              </div>
            </div>

            <section className="candidate-detail-section" aria-label="Vacancy associations">
              <div className="candidate-section-heading">
                <h3>Vacancy associations</h3>
                <span>
                  {person.assignments.length}{" "}
                  {person.assignments.length === 1 ? "assignment" : "assignments"}
                </span>
              </div>
              <p className="candidate-section-note">
                Choose a vacancy to review its fit, research and recruiter workflow.
              </p>
              <div className="candidate-association-list">
                {person.assignments.map(({ vacancy: associatedVacancy, candidate: assignment }) => (
                  <button
                    type="button"
                    key={assignment.assignmentId}
                    aria-pressed={vacancy.id === associatedVacancy.id}
                    disabled={pending}
                    onClick={() => {
                      setVacancyId(associatedVacancy.id);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    <span>
                      <strong>{associatedVacancy.title}</strong>
                      <small>{associatedVacancy.employerName}</small>
                    </span>
                    <span>
                      {candidateLabel(assignment.marketBucket)}
                      <small>{workflowLabel(assignment.operationalStatus)}</small>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="candidate-detail-section">
              <div className="candidate-section-heading">
                <h3>Role-specific fit</h3>
                <Badge value={candidate.qaStatus} />
              </div>
              <div className="candidate-detail-context">
                <span>
                  <strong>Research bucket</strong>
                  {candidateLabel(candidate.marketBucket)}
                </span>
                <span>
                  <strong>Recruiter workflow</strong>
                  {workflowLabel(candidate.operationalStatus)}
                </span>
                <span>
                  <strong>Comparable employer tier</strong>
                  {candidate.comparableTier ? `Tier ${candidate.comparableTier}` : "Not recorded"}
                </span>
                <span>
                  <strong>Last verified</strong>
                  {candidateDate(candidate.lastVerified)}
                </span>
              </div>
              <p className="candidate-fit-narrative">
                {candidate.whyFit || "No role-specific fit assessment has been recorded."}
              </p>
              <div className="candidate-employer-context">
                <Building2 size={18} aria-hidden="true" />
                <div>
                  <strong>Employer context</strong>
                  <p>
                    {candidate.currentEmployer || "Candidate employer not recorded"} →{" "}
                    {vacancy.employerName || "Vacancy employer not recorded"}
                  </p>
                  <span>
                    Vacancy employer resolution: <Badge value={vacancy.employerStatus} />
                  </span>
                </div>
              </div>
              <Link
                prefetch={false}
                className="candidate-text-link"
                href={`/?vacancy=${encodeURIComponent(vacancy.id)}&candidate=${encodeURIComponent(candidate.candidateId)}`}
              >
                Open full vacancy market
                <ArrowRight size={14} />
              </Link>
            </section>

            <section className="candidate-detail-section" aria-label="Candidate claims">
              <div className="candidate-section-heading">
                <h3>Evidence &amp; claims</h3>
                <FileCheck2 size={19} aria-hidden="true" />
              </div>
              <p className="candidate-section-note">
                Evidence confidence is recorded per claim; unverified claims remain visible.
              </p>
              <div className="candidate-claims-grid">
                {EVIDENCE_GROUPS.map(({ status, title }) => {
                  const claims = candidate.claims.filter((claim) => claim.status === status);
                  return (
                    <section
                      className={`candidate-claim-group candidate-claims-${status.toLowerCase()}`}
                      key={status}
                      aria-label={title}
                    >
                      <h4>
                        <span className="candidate-evidence-dot" />
                        {title}
                        <span>{claims.length}</span>
                      </h4>
                      {claims.length === 0 ? (
                        <p className="candidate-no-evidence">None recorded</p>
                      ) : (
                        <dl>
                          {claims.map((claim, index) => (
                            <div key={`${claim.name}:${index}`}>
                              <dt>{claim.name}</dt>
                              <dd>{claim.value || "Value not recorded"}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </section>
                  );
                })}
              </div>
            </section>

            <section className="candidate-detail-section candidate-gaps">
              <div className="candidate-section-heading">
                <h3>QA challenges &amp; evidence gaps</h3>
                <CircleAlert size={19} aria-hidden="true" />
              </div>
              {candidate.qaStatus === "FAIL_RESEARCH_REQUIRED" && (
                <p className="candidate-qa-warning">
                  QA requires further research before this assignment is treated as ready.
                </p>
              )}
              {candidate.evidenceGaps.length > 0 ? (
                <ul>
                  {candidate.evidenceGaps.map((gap, index) => (
                    <li key={`${gap}:${index}`}>{gap}</li>
                  ))}
                </ul>
              ) : (
                <p className="candidate-section-note">
                  No specific evidence gaps recorded. This does not verify unconfirmed claims.
                </p>
              )}
            </section>

            <section className="candidate-detail-section">
              <div className="candidate-section-heading">
                <h3>Public sources &amp; recency</h3>
                <ExternalLink size={17} aria-hidden="true" />
              </div>
              {profileUrl ? (
                <a
                  className="candidate-text-link"
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open recorded public profile
                  <ExternalLink size={14} />
                </a>
              ) : (
                <p className="candidate-section-note">
                  No public profile source link is recorded for this candidate.
                </p>
              )}
              <p className="candidate-section-note">
                Assignment last verified: {candidateDate(candidate.lastVerified)}. Claim-level
                source URLs are not supplied in this read model.
              </p>
            </section>

            <section className="candidate-detail-section candidate-workflow">
              <div className="candidate-section-heading">
                <h3>Recruiter actions</h3>
                <ShieldCheck size={19} aria-hidden="true" />
              </div>
              <p className="candidate-section-note">
                Update the workflow for <strong>{vacancy.title}</strong>. Research Top 10 and
                Recruiter Top 10 are separate decisions.
              </p>
              <div
                className="candidate-workflow-current"
                role="group"
                aria-label="Current recruiter stage"
              >
                <span>{workflowLabel(candidate.operationalStatus)}</span>
              </div>
              <p className="candidate-section-note">
                Current status only. Earlier workflow history is not available in this read model.
              </p>
              {demoMode && (
                <div className="candidate-demo-note">
                  Demo mode · local page changes reset on reload.
                </div>
              )}
              {candidate.operationalStatus === "EXCLUDED" && (
                <p className="candidate-excluded-reason">
                  <strong>Recruiter exclusion reason:</strong>{" "}
                  {candidate.excludedReason || "Not recorded"}
                </p>
              )}
              <div className="candidate-workflow-actions">
                <label className="field">
                  <span>Recruiter workflow status</span>
                  <select
                    ref={workflowInput}
                    aria-label="Recruiter workflow status"
                    value={target}
                    disabled={pending}
                    onChange={(event) => {
                      setTargets((current) => ({
                        ...current,
                        [vacancy.id]: event.target
                          .value as CandidateAssignment["operationalStatus"],
                      }));
                      setError("");
                      setSuccess("");
                    }}
                  >
                    {CANDIDATE_OPERATIONAL_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                        disabled={!canChangeWorkflow(candidate.operationalStatus, status)}
                      >
                        {workflowLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    pending ||
                    target === candidate.operationalStatus ||
                    !canChangeWorkflow(candidate.operationalStatus, target)
                  }
                  onClick={() => {
                    if (target === "EXCLUDED") {
                      setExcluding(true);
                      setError("");
                      setSuccess("");
                    } else void save(target);
                  }}
                >
                  {pending ? <LoaderCircle className="candidate-spinner" size={16} /> : null}
                  {pending ? "Saving workflow…" : "Update workflow"}
                </button>
              </div>
              <p className="candidate-section-note">
                Earlier stages are disabled after progression. Earmarked and Recruiter Top 10 can be
                unmarked while current; excluded candidates restore to Relevant.
              </p>
              {error && (
                <div role="alert" className="candidate-feedback candidate-feedback-error">
                  {error}
                </div>
              )}
              {success && (
                <div role="status" className="candidate-feedback candidate-feedback-success">
                  {success}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Dialog>
  );
}

function UsersIcon({ name }: { name: string }) {
  return (
    <span aria-hidden="true">
      {name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")}
    </span>
  );
}
