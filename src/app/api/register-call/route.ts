import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";
import { createClient } from "@supabase/supabase-js";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    logger.info("register-call request received");

    const body = await req.json();

    const interviewerId = body.interviewer_id;

    if (!interviewerId || interviewerId === 0) {
      logger.error("Missing or invalid interviewer_id in request");
      return NextResponse.json(
        { error: "Missing or invalid interviewer_id" },
        { status: 400 },
      );
    }

    // Server-side session validation: if token and session_id are provided,
    // verify this session is the active one before allowing call registration
    const { token, session_id } = body;
    if (token && session_id) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: response } = await supabase
        .from("response")
        .select("active_session_id, is_ended")
        .eq("token", token)
        .single();

      if (response) {
        if (response.is_ended) {
          logger.warn("[register-call] Interview already ended", { token });
          return NextResponse.json(
            { error: "Interview has already ended" },
            { status: 410 },
          );
        }

        if (response.active_session_id && response.active_session_id !== session_id) {
          logger.warn("[register-call] Session mismatch — blocking call registration", {
            token,
            expected: session_id,
            active: response.active_session_id,
          });
          return NextResponse.json(
            { error: "Session conflict", message: "This interview is active on another device" },
            { status: 409 },
          );
        }
      }
    }

    if (!process.env.RETELL_API_KEY) {
      logger.error("RETELL_API_KEY is not configured");
      return NextResponse.json(
        { error: "Retell API key not configured" },
        { status: 500 },
      );
    }

    // Convert to bigint if needed (getInterviewer expects bigint)
    const interviewerIdBigInt = typeof interviewerId === 'bigint' 
      ? interviewerId 
      : BigInt(interviewerId);

    const interviewer = await InterviewerService.getInterviewer(interviewerIdBigInt);

    if (!interviewer) {
      logger.error(`Interviewer not found for id: ${interviewerId}`);
      return NextResponse.json(
        { error: "Interviewer not found" },
        { status: 404 },
      );
    }

    if (!interviewer.agent_id) {
      logger.error(`Interviewer ${interviewerId} has no agent_id`);
      return NextResponse.json(
        { error: "Interviewer has no agent_id configured" },
        { status: 400 },
      );
    }

    logger.info(`Registering call with agent_id: ${interviewer.agent_id}`);

    const registerCallResponse = await retellClient.call.createWebCall({
      agent_id: interviewer.agent_id,
      retell_llm_dynamic_variables: body.dynamic_data,
    });

    logger.info("Call registered successfully", {
      call_id: registerCallResponse?.call_id,
    });

    return NextResponse.json(
      {
        registerCallResponse,
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error("Error registering call:", error);
    
    // Check if it's a Retell API error
    if (error?.response?.data) {
      logger.error("Retell API error:", error.response.data);
      return NextResponse.json(
        {
          error: "Retell API error",
          details: error.response.data,
        },
        { status: error.response.status || 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to register call",
        message: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
