import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody, validateVacancyOperation } from "@/lib/ops/validation";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const validation = validateVacancyOperation(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { vacancyId, reason, reasonDetail } = validation.value;

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

  const now = new Date().toISOString();
  const operation: Record<string, string | null> = {
    workspace_id: vacancy.workspace_id,
    vacancy_id: vacancyId,
    lifecycle_status: "CLOSED",
    closed_reason: reason,
    closed_at: now,
    last_user_action_at: now,
  };
  // Only written when present, so a FILLED close still succeeds if migration
  // 008 has not been applied yet. OTHER cannot be stored without that column.
  if (reasonDetail) operation.closed_reason_detail = reasonDetail;

  const { error } = await supabase.from("vacancy_operations").upsert(operation, {
    onConflict: "workspace_id,vacancy_id",
  });

  if (error) {
    console.error("vacancy operation failed", error.message);
    return NextResponse.json(
      { error: "Vacancy operation could not be saved." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, lifecycleStatus: "CLOSED", reason, reasonDetail });
}
