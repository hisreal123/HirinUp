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

    const { interview_id } = body;

    if (!interview_id) {

      return NextResponse.json({ error: "interview_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("response")
      .select("email")
      .eq("interview_id", interview_id)
      .eq("is_ended", false);

    if (error) {
      logger.error("[get-emails] Error:", error);

      return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
    }

    if (raw.cpk) {
      const encrypted = await serverEncryptResponse(data || [], raw.cpk);

      return NextResponse.json(encrypted, { status: 200 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (err: any) {
    logger.error("[get-emails] Error:", err.message);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
