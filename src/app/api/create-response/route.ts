import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { nanoid } from "nanoid";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/actions/verify-turnstile";
import { serverDecryptPayload, serverEncryptResponse } from "@/lib/crypto";

/**
 * Creates a response record early (before the call starts)
 * Requires Turnstile verification for security.
 * Payload and response are ECDH + AES-GCM encrypted end-to-end.
 */
export async function POST(req: Request) {
  try {
    const raw = await req.json();

    // Decrypt payload if encrypted (has data + iv + cpk)
    let body: any;
    if (raw.data && raw.iv && raw.cpk) {
      body = await serverDecryptPayload(raw.data, raw.iv, raw.cpk);
    } else {
      body = raw;
    }

    const clientPublicKey = raw.cpk ?? null;
    const { interview_id, email, name, call_id, candidate_id, turnstile_token } = body;

    if (!interview_id) {

      return NextResponse.json(
        { error: "interview_id is required" },
        { status: 400 },
      );
    }

    // Determine if this is a candidate submission (has call_id) or admin link generation
    const isCandidateSubmission = !!call_id;
    let turnstileVerified = false;

    // Verify Turnstile token - required for candidate submissions
    if (isCandidateSubmission) {
      if (!turnstile_token) {
        logger.warn("Candidate submission without turnstile_token", { interview_id, call_id });

        return NextResponse.json(
          { error: "Verification required" },
          { status: 403 },
        );
      }

      const turnstileResult = await verifyTurnstile(turnstile_token);
      if (!turnstileResult.success) {
        logger.warn("Turnstile verification failed", { interview_id, error: turnstileResult.error });

        return NextResponse.json(
          { error: "Verification failed", details: turnstileResult.error },
          { status: 403 },
        );
      }
      turnstileVerified = true;
      logger.info("create-response request received (candidate verified)", { interview_id, email });
    } else {
      // Admin link generation - no Turnstile required
      logger.info("create-response request received (admin link generation)", { interview_id });
    }

    // Generate a random token for the response
    const responseToken = nanoid();
    logger.info("Generated token", { token: responseToken });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error("Supabase credentials not configured");

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: responseData, error: insertError } = await supabase
      .from("response")
      .insert({
        interview_id,
        email: email || null,
        name: name || null,
        token: responseToken,
        call_id: call_id || null,
        candidate_id: candidate_id || null,
        is_ended: false,
        is_analysed: false,
        is_viewed: false,
        turnstile_verified: turnstileVerified,
      })
      .select("id, token")
      .single();

    if (insertError) {
      logger.error("Error inserting response:", insertError);

      return NextResponse.json(
        { error: "Failed to create response", details: insertError.message },
        { status: 500 },
      );
    }

    if (!responseData) {
      logger.error("No data returned from insert");

      return NextResponse.json(
        { error: "Failed to create response", details: "No data returned" },
        { status: 500 },
      );
    }

    const responseId = responseData.id;

    if (!responseId) {
      logger.error("Failed to create response - responseId is null");

      return NextResponse.json(
        { error: "Failed to create response", details: "No response ID returned" },
        { status: 500 },
      );
    }

    logger.info("Response created successfully", {
      responseId,
      token: responseData.token,
    });

    // Encrypt response if client sent a public key
    if (clientPublicKey) {
      const encrypted = await serverEncryptResponse(
        { response_id: responseToken },
        clientPublicKey
      );

      return NextResponse.json(encrypted, { status: 200 });
    }

    return NextResponse.json(
      { response_id: responseToken },
      { status: 200 },
    );
  } catch (err: any) {
    logger.error("Error creating response", { error: err.message });

    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}
