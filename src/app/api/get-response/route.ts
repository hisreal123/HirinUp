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

    const { token } = body;

    if (!token) {

      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("response")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) {
      logger.warn("[get-response] Not found:", { token });

      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    if (raw.cpk) {
      const encrypted = await serverEncryptResponse(data, raw.cpk);

      return NextResponse.json(encrypted, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    logger.error("[get-response] Error:", err.message);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
