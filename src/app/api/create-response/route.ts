import { NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";
import { logger } from "@/lib/logger";
import { nanoid } from "nanoid";
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a response record early (before the call starts)
 * This allows us to track candidates and generate unique links per response
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { interview_id, email, name } = body;

    if (!interview_id) {
      return NextResponse.json(
        { error: "interview_id is required" },
        { status: 400 },
      );
    }

    logger.info("create-response request received", { interview_id, email });

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
        is_ended: false,
        is_analysed: false,
        is_viewed: false,
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

