import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ingestKey = process.env.INGEST_API_KEY;

  if (!supabaseUrl || !ingestKey) {
    return NextResponse.json(
      { error: "Ingestion proxy is not configured." },
      { status: 503 }
    );
  }

  const supplied = request.headers.get("authorization");
  if (supplied !== `Bearer ${ingestKey}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.text();

  const upstream = await fetch(`${supabaseUrl}/functions/v1/ingest-run`, {
    method: "POST",
    headers: {
      "content-type": request.headers.get("content-type") || "application/json",
      authorization: `Bearer ${ingestKey}`,
    },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  });
}
