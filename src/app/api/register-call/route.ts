import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

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
