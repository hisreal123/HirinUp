import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { nanoid } from "nanoid";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/actions/verify-turnstile";

/**
 * Creates a response record early (before the call starts)
 * This allows us to track candidates and generate unique links per response
 * Requires Turnstile verification for security
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
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
      // TODO: Add admin authentication check here for additional security
      logger.info("create-response request received (admin link generation)", { interview_id });
    }

    // Generate a random token for the response (similar to interview IDs)
    const responseToken = nanoid();
    logger.info("Generated token", { token: responseToken });

    // Create server-side Supabase client for API route
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

    // Insert response directly to ensure token is saved
    const { data: responseData, error: insertError } = await supabase
      .from("response")
      .insert({
        interview_id,
        email: email || null,
        name: name || null,
        token: responseToken, // Add the random token
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
      logger.error("Payload:", { interview_id, token: responseToken, email, name });
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

    // Verify token was saved correctly
    logger.info("Response insert result:", {
      responseId,
      tokenInResponse: responseData.token,
      expectedToken: responseToken,
      fullResponseData: responseData
    });

    if (!responseData.token || responseData.token !== responseToken) {
      logger.error("Token not saved correctly!", { 
        expected: responseToken, 
        actual: responseData.token,
        responseData: responseData
      });
      // Still return success since the response was created, but log the issue
    }

    logger.info("Response created successfully", { 
      responseId, 
      token: responseData.token,
      expectedToken: responseToken 
    });

    return NextResponse.json(
      { response_id: responseToken }, // Return the token instead of numeric ID
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

