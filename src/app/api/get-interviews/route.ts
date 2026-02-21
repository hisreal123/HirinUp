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

    const { userId, organizationId } = body;

    if (!userId && !organizationId) {
      return NextResponse.json({ error: "userId or organizationId is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("interview")
      .select("*")
      .or(`organization_id.eq.${organizationId},user_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      logger.warn("[get-interviews] Query error:", { error });
      return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
    }

    const result = data || [];

    if (raw.cpk) {
      const encrypted = await serverEncryptResponse(result, raw.cpk);
      return NextResponse.json(encrypted, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    logger.error("[get-interviews] Error:", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
