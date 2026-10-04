import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowed = new Set(["SURFACED","RELEVANT","EARMARKED","TOP_10","APPROACH","ENGAGED","SUBMITTED","EXCLUDED"]);

export async function POST(request: Request) {
  const body = await request.json();
  const { vacancyId, candidateId, operationalStatus } = body ?? {};

  if (!vacancyId || !candidateId || !allowed.has(operationalStatus)) {
    return NextResponse.json({ error: "Invalid candidate operation." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: vacancy, error: vacancyError } = await supabase
    .from("vacancies")
    .select("workspace_id")
    .eq("id", vacancyId)
    .single();

  if (vacancyError || !vacancy) {
    return NextResponse.json({ error: "Vacancy not found." }, { status: 404 });
  }

  const { error } = await supabase.from("candidate_operations").upsert(
    {
      workspace_id: vacancy.workspace_id,
      vacancy_id: vacancyId,
      candidate_id: candidateId,
      operational_status: operationalStatus,
      last_user_action_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,vacancy_id,candidate_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
