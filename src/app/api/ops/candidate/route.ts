import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody, validateCandidateOperation } from "@/lib/ops/validation";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const validation = validateCandidateOperation(body);
  if (!validation.ok) {
    // Malformed payloads and contract violations are client errors, never 500s.
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { vacancyId, candidateId, operationalStatus, excludedReason } = validation.value;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: vacancy, error: vacancyError } = await supabase
    .from("vacancies")
    .select("workspace_id")
    .eq("id", vacancyId)
    .single();

  if (vacancyError || !vacancy) {
    return NextResponse.json({ error: "Vacancy not found." }, { status: 404 });
  }

  // The operation must attach to a candidate already mapped to this vacancy
  // in the same workspace. A bare candidate UUID from another workspace must
  // not create a cross-workspace operational row.
  const { data: assignment, error: assignmentError } = await supabase
    .from("candidate_assignments")
    .select("id")
    .eq("workspace_id", vacancy.workspace_id)
    .eq("vacancy_id", vacancyId)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (assignmentError || !assignment) {
    return NextResponse.json(
      { error: "Candidate is not mapped to this vacancy." },
      { status: 404 }
    );
  }

  const { error } = await supabase.from("candidate_operations").upsert(
    {
      workspace_id: vacancy.workspace_id,
      vacancy_id: vacancyId,
      candidate_id: candidateId,
      operational_status: operationalStatus,
      // Evidence untouched: only the recruiter workflow column changes, and the
      // exclusion reason is stored on the operational record (never on the
      // candidate or the research assignment).
      excluded_reason: excludedReason,
      last_user_action_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,vacancy_id,candidate_id" }
  );

  if (error) {
    console.error("candidate operation failed", error.message);
    return NextResponse.json(
      { error: "Candidate operation could not be saved." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    operationalStatus,
    excludedReason,
  });
}
