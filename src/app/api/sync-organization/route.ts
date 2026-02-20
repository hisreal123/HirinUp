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

    const { id, name, image_url } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Check if org already exists
    const { data: existing } = await supabase
      .from("organization")
      .select("*")
      .eq("id", id)
      .single();

    let result: any = null;

    if (!existing) {
      // Create org with defaults
      const { data: created, error: createError } = await supabase
        .from("organization")
        .insert({ id, name, image_url, plan: "free", allowed_responses_count: 10 })
        .select()
        .single();

      if (createError) {
        logger.error("[sync-organization] Insert error:", createError.message);
        return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
      }

      result = created;
    } else {
      // Update name/image if they changed or were null
      const needsUpdate =
        (name && existing.name !== name) ||
        (image_url && existing.image_url !== image_url);

      if (needsUpdate) {
        const { data: updated } = await supabase
          .from("organization")
          .update({ name, image_url })
          .eq("id", id)
          .select()
          .single();

        result = updated ?? existing;
      } else {
        result = existing;
      }
    }

    if (raw.cpk && result) {
      const encrypted = await serverEncryptResponse(result, raw.cpk);
      return NextResponse.json(encrypted, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    logger.error("[sync-organization] Error:", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
