import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse, NextRequest } from "next/server";
import Retell from "retell-sdk";
import { INTERVIEWERS, RETELL_AGENT_GENERAL_PROMPT } from "@/lib/constants";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function GET(req: NextRequest) {
  logger.info("create-interviewer request received");

  try {
    // Check if RETELL_API_KEY is configured
    if (!process.env.RETELL_API_KEY) {
      logger.error("RETELL_API_KEY is not configured");
      return NextResponse.json(
        { error: "RETELL_API_KEY is not configured" },
        { status: 500 },
      );
    }

    // Check if interviewers already exist
    const allInterviewers = await InterviewerService.getAllInterviewers();
    const existingLisa = allInterviewers.find(
      (i) => i.name === INTERVIEWERS.LISA.name,
    );
    const existingBob = allInterviewers.find(
      (i) => i.name === INTERVIEWERS.BOB.name,
    );

    let newInterviewer = existingLisa;
    let newSecondInterviewer = existingBob;

    // Create Lisa if it doesn't exist
    if (!existingLisa) {
      try {
        logger.info("Creating Retell LLM model...");
        const newModel = await retellClient.llm.create({
          model: "gpt-4o",
          general_prompt: RETELL_AGENT_GENERAL_PROMPT,
          general_tools: [
            {
              type: "end_call",
              name: "end_call_1",
              description:
                "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
            },
          ],
        });

        logger.info("Creating Retell agent for Lisa...");
        const newFirstAgent = await retellClient.agent.create({
          response_engine: { llm_id: newModel.llm_id, type: "retell-llm" },
          voice_id: "11labs-Chloe",
          agent_name: "Lisa",
        });

        logger.info("Saving Lisa interviewer to database...");
        newInterviewer = await InterviewerService.createInterviewer({
          agent_id: newFirstAgent.agent_id,
          ...INTERVIEWERS.LISA,
        });

        if (newInterviewer) {
          logger.info("Lisa interviewer created successfully:", newInterviewer.id);
        }
      } catch (error: any) {
        logger.error("Error creating Lisa interviewer:", error?.message || error);
        console.error("Full error:", error);
        // Continue to try creating Bob even if Lisa fails
      }
    } else {
      logger.info("Lisa interviewer already exists, skipping creation");
    }

    // Create Bob if it doesn't exist
    if (!existingBob) {
      try {
        logger.info("Creating Retell LLM model for Bob...");
        const newModel = await retellClient.llm.create({
          model: "gpt-4o",
          general_prompt: RETELL_AGENT_GENERAL_PROMPT,
          general_tools: [
            {
              type: "end_call",
              name: "end_call_1",
              description:
                "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
            },
          ],
        });

        logger.info("Creating Retell agent for Bob...");
        const newSecondAgent = await retellClient.agent.create({
          response_engine: { llm_id: newModel.llm_id, type: "retell-llm" },
          voice_id: "11labs-Brian",
          agent_name: "Bob",
        });

        logger.info("Saving Bob interviewer to database...");
        newSecondInterviewer = await InterviewerService.createInterviewer({
          agent_id: newSecondAgent.agent_id,
          ...INTERVIEWERS.BOB,
        });

        if (newSecondInterviewer) {
          logger.info("Bob interviewer created successfully:", newSecondInterviewer.id);
        }
      } catch (error: any) {
        logger.error("Error creating Bob interviewer:", error?.message || error);
        console.error("Full error:", error);
      }
    } else {
      logger.info("Bob interviewer already exists, skipping creation");
    }

    return NextResponse.json(
      {
        newInterviewer,
        newSecondInterviewer,
        message: existingLisa && existingBob
          ? "Interviewers already exist"
          : "Interviewers created or retrieved",
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error("Error creating interviewers:", error?.message || error);
    console.error("Full error:", error);

    return NextResponse.json(
      {
        error: "Failed to create interviewers",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
