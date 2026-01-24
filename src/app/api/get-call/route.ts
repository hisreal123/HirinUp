import { logger } from "@/lib/logger";
import { generateInterviewAnalytics } from "@/services/analytics.service";
import { ResponseService } from "@/services/responses.service";
import { Response } from "@/types/response";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request) {
  logger.info("get-call request received");
  
  try {
    const body = await req.json();

    if (!body.id) {
      logger.error("Call ID is required");
      return NextResponse.json(
        { error: "Call ID is required" },
        { status: 400 },
      );
    }

    // Check if RETELL_API_KEY is configured
    if (!process.env.RETELL_API_KEY) {
      logger.error("RETELL_API_KEY is not configured");
      return NextResponse.json(
        { error: "RETELL API key is not configured" },
        { status: 500 },
      );
    }

    const callDetails: Response | null = await ResponseService.getResponseByCallId(
      body.id,
    );

    // If call details exist and are already analyzed, return them
    if (callDetails && callDetails.is_analysed) {
      return NextResponse.json(
        {
          callResponse: callDetails.details,
          analytics: callDetails.analytics,
        },
        { status: 200 },
      );
    }

    // If call details don't exist or aren't analyzed, fetch from Retell
    let callOutput;
    try {
      callOutput = await retell.call.retrieve(body.id);
    } catch (retellError: any) {
      logger.error("Error retrieving call from Retell:", retellError);
      return NextResponse.json(
        {
          error: "Failed to retrieve call from Retell",
          details: retellError?.message || "Unknown error",
        },
        { status: 500 },
      );
    }

    if (!callOutput) {
      logger.error("No call data returned from Retell");
      return NextResponse.json(
        { error: "Call not found in Retell" },
        { status: 404 },
      );
    }

    const interviewId = callDetails?.interview_id;
    const callResponse = callOutput;
    
    // Calculate duration safely
    let duration = 0;
    if (callResponse.end_timestamp && callResponse.start_timestamp) {
      duration = Math.round(
        (callResponse.end_timestamp - callResponse.start_timestamp) / 1000,
      );
    }

    // Generate analytics if we have a transcript
    let analytics = null;
    if (callResponse.transcript && interviewId) {
      const payload = {
        callId: body.id,
        interviewId: interviewId,
        transcript: callResponse.transcript,
      };
      
      try {
        const result = await generateInterviewAnalytics(payload);
        analytics = result.analytics;
      } catch (analyticsError) {
        const errorMessage = analyticsError instanceof Error ? analyticsError.message : String(analyticsError);
        logger.error("Error generating analytics:", errorMessage);
        // Continue without analytics rather than failing completely
      }
    }

    // Save the response to database
    try {
      logger.info("Attempting to save response details:", {
        call_id: body.id,
        hasCallResponse: !!callResponse,
        hasTranscript: !!callResponse.transcript,
        hasAnalytics: analytics !== null,
        duration,
      });

      const saveResult = await ResponseService.saveResponse(
        {
          details: callResponse,
          is_analysed: analytics !== null,
          duration: duration,
          analytics: analytics,
        },
        body.id,
      );

      if (!saveResult || saveResult.length === 0) {
        logger.error("Failed to save response - no rows updated:", {
          call_id: body.id,
          saveResult,
          hasCallResponse: !!callResponse,
          callResponseKeys: callResponse ? Object.keys(callResponse).slice(0, 10) : [],
        });
        
        // Try to check if response exists
        const checkResponse = await ResponseService.getResponseByCallId(body.id);
        logger.error("Response check after failed save:", {
          call_id: body.id,
          responseExists: !!checkResponse,
          hasCallId: !!checkResponse?.call_id,
          responseId: checkResponse?.id,
        });
      } else {
        logger.info("Successfully saved response details:", {
          call_id: body.id,
          updatedRows: saveResult.length,
          hasDetails: !!saveResult[0]?.details,
          detailsKeys: saveResult[0]?.details ? Object.keys(saveResult[0].details).slice(0, 10) : [],
          isAnalysed: saveResult[0]?.is_analysed,
          duration: saveResult[0]?.duration,
        });
      }
    } catch (saveError) {
      const errorMessage = saveError instanceof Error ? saveError.message : String(saveError);
      logger.error("Error saving response:", errorMessage);
      logger.error("Save error stack:", saveError instanceof Error ? saveError.stack : "No stack trace");
      // Continue and return the data even if save fails
    }

    logger.info("Call retrieved and processed successfully");

    return NextResponse.json(
      {
        callResponse,
        analytics,
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error("Error in get-call route:", error?.message || error);
    console.error("Full error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
