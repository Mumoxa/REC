import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const closeReasons = new Set([
  "FILLED","EXPIRED","CLIENT_NO_LONGER_HIRING","NOT_COMMERCIALLY_RELEVANT","DUPLICATE","CANCELLED","OTHER",
]);

export async function POST(request: Request) {
  const body = await request.json();
  const { vacancyId, action, reason } = body ?? {};

  if (!vacancyId || action !== "CLOSE" || !closeReasons.has(reason)) {
    return NextResponse.json({ error: "Invalid vacancy operation." }, { status: 400 });
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

  const now = new Date().toISOString();
  const { error } = await supabase.from("vacancy_operations").upsert(
    {
      workspace_id: vacancy.workspace_id,
      vacancy_id: vacancyId,
      lifecycle_status: "CLOSED",
      closed_reason: reason,
      closed_at: now,
      last_user_action_at: now,
    },
    { onConflict: "workspace_id,vacancy_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
