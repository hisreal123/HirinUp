import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { serverDecryptPayload, serverEncryptResponse } from "@/lib/crypto";
import { logger } from "@/lib/logger";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const raw = await req.json();

    let body: any;
    if (raw.data && raw.iv && raw.cpk) {
      body = await serverDecryptPayload(raw.data, raw.iv, raw.cpk);
    } else {
      body = raw;
    }

    const { id, email, organization_id } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Step 1: Fetch existing user
    const { data: existing } = await supabase
      .from("user")
      .select("*")
      .filter("id", "eq", id);

    let result: any = null;

    if (!existing || existing.length === 0) {
      // Step 2: Upsert if not found
      const { data: upserted, error: upsertError } = await supabase
        .from("user")
        .upsert(
          { id, email, organization_id },
          { onConflict: "id", ignoreDuplicates: true }
        )
        .select();

      if (upsertError) {
        logger.error("[sync-user] Upsert error:", upsertError.message);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
      }

      result = upserted ? upserted[0] : null;
    } else if (existing[0].organization_id !== organization_id) {
      // Step 3: Update org if changed
      const { data: updated } = await supabase
        .from("user")
        .update({ organization_id })
        .eq("id", id)
        .select();

      result = updated ? updated[0] : existing[0];
    } else {
      result = existing[0];
    }

    if (raw.cpk && result) {
      const encrypted = await serverEncryptResponse(result, raw.cpk);
      return NextResponse.json(encrypted, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    logger.error("[sync-user] Error:", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
