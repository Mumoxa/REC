import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, viewState } = body ?? {};
  if (!name || typeof viewState !== "object" || viewState === null || Array.isArray(viewState)) {
    return NextResponse.json({ error: "Invalid saved view payload." }, { status: 400 });
  }
  if (typeof name !== "string" || name.trim().length === 0 || name.trim().length > 80) {
    return NextResponse.json({ error: "Invalid view name." }, { status: 400 });
  }
  // P2: guard against oversized viewState (DoS via large JSON)
  try {
    const serialized = JSON.stringify(viewState);
    if (serialized.length > 20_000) {
      return NextResponse.json({ error: "viewState too large (max 20KB)." }, { status: 413 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid viewState." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = process.env.WORKSPACE_SLUG || "talent-tree";
  const { data: workspace } = await supabase.from("workspaces").select("id").eq("slug", slug).maybeSingle();
  if (!workspace) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });

  const { data, error } = await supabase.from("saved_views").upsert(
    {
      workspace_id: workspace.id,
      user_id: authData.claims.sub,
      name,
      view_state: viewState,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,user_id,name" }
  ).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, savedView: data });
}
