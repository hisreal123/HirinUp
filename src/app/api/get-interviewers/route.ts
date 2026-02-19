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

    const { data, error } = await supabase
      .from("interviewer")
      .select("*");

    if (error) {
      logger.warn("[get-interviewers] Query error:", { error });
      return NextResponse.json({ error: "Failed to fetch interviewers" }, { status: 500 });
    }

    const result = data || [];

    if (raw.cpk) {
      const encrypted = await serverEncryptResponse(result, raw.cpk);
      return NextResponse.json(encrypted, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    logger.error("[get-interviewers] Error:", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
