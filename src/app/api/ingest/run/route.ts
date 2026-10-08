import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/ops/validation";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ingestKey = process.env.INGEST_API_KEY;

  if (!supabaseUrl || !ingestKey) {
    return NextResponse.json(
      { error: "Ingestion proxy is not configured." },
      { status: 503 }
    );
  }

  const supplied = request.headers.get("authorization") ?? "";
  if (!safeEqual(supplied, `Bearer ${ingestKey}`)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declaredLength) && declaredLength > 8_000_000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  // Bounded read: a publication payload is structured JSON, never a stream.
  const body = await request.text();
  if (body.length > 8_000_000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${supabaseUrl}/functions/v1/ingest-run`, {
      method: "POST",
      headers: {
        "content-type": request.headers.get("content-type") || "application/json",
        authorization: `Bearer ${ingestKey}`,
      },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "REC ingestion upstream is unavailable." },
      { status: 502 }
    );
  }

  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  });
}

export async function GET() {
  // Never echo configuration state as a boolean oracle on the write endpoint.
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
