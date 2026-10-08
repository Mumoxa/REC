import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody, validateSavedView } from "@/lib/ops/validation";
import { sanitizeViewState } from "@/lib/workspace/view-state";

export async function POST(request: Request) {
  const body = await readJsonBody(request, 40_000);
  const validation = validateSavedView(body);
  if (!validation.ok) {
    const status = validation.error.startsWith("viewState too large") ? 413 : 400;
    return NextResponse.json({ error: validation.error }, { status });
  }
  const { name, viewState } = validation.value;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = process.env.WORKSPACE_SLUG || "talent-tree";
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!workspace) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });

  // Only view state is persistable. Anything else in the payload is dropped so
  // a saved view can never carry research evidence.
  const safeViewState = sanitizeViewState(viewState);

  const { data, error } = await supabase
    .from("saved_views")
    .upsert(
      {
        workspace_id: workspace.id,
        user_id: authData.claims.sub,
        name,
        view_state: safeViewState,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id,user_id,name" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("saved view upsert failed", error.message);
    return NextResponse.json({ error: "Saved view could not be saved." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, savedView: data });
}
