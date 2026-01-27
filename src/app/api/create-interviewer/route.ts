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
    logger.info("Checking RETELL_API_KEY configuration...");

    if (!process.env.RETELL_API_KEY) {
      logger.error("RETELL_API_KEY is not configured");

      return NextResponse.json(
        { error: "RETELL_API_KEY is not configured" },
        { status: 500 },
      );
    }

    // Log API key info (first 10 chars for security)
    const apiKeyPreview = process.env.RETELL_API_KEY.substring(0, 10) + "...";
    logger.info("Using Retell API key", { preview: apiKeyPreview });

    // Check if interviewers already exist
    const allInterviewers = await InterviewerService.getAllInterviewers();
    const existingLisas = allInterviewers.filter(
      (i) => i.name === INTERVIEWERS.LISA.name,
    );
    const existingBobs = allInterviewers.filter(
      (i) => i.name === INTERVIEWERS.BOB.name,
    );

    // Keep the first one, delete duplicates (to avoid breaking existing interviews)
    const existingLisa = existingLisas.length > 0 ? existingLisas[0] : null;
    const existingBob = existingBobs.length > 0 ? existingBobs[0] : null;

    // Delete duplicate interviewers (keep the first one to preserve foreign key references)
    if (existingLisas.length > 1) {
      logger.info(
        `Found ${existingLisas.length} Lisa interviewer(s), keeping first one (id: ${existingLisa?.id}), deleting ${existingLisas.length - 1} duplicate(s)...`,
      );
      for (let i = 1; i < existingLisas.length; i++) {
        try {
          await InterviewerService.deleteInterviewer(existingLisas[i].id);
          logger.info(
            `Deleted duplicate Lisa interviewer with id: ${existingLisas[i].id}`,
          );
        } catch (error: any) {
          logger.warn(
            `Could not delete duplicate Lisa interviewer ${existingLisas[i].id}:`,
            error?.message,
          );
        }
      }
    }

    if (existingBobs.length > 1) {
      logger.info(
        `Found ${existingBobs.length} Bob interviewer(s), keeping first one (id: ${existingBob?.id}), deleting ${existingBobs.length - 1} duplicate(s)...`,
      );
      for (let i = 1; i < existingBobs.length; i++) {
        try {
          await InterviewerService.deleteInterviewer(existingBobs[i].id);
          logger.info(
            `Deleted duplicate Bob interviewer with id: ${existingBobs[i].id}`,
          );
        } catch (error: any) {
          logger.warn(
            `Could not delete duplicate Bob interviewer ${existingBobs[i].id}:`,
            error?.message,
          );
        }
      }
    }

    let newInterviewer = existingLisa;
    let newSecondInterviewer = existingBob;

    // Create or update Lisa
    {
      try {
        logger.info("Creating Retell LLM model for Lisa...");
        const newModel = await retellClient.llm.create({
          model: "gpt-4o",
          general_prompt: RETELL_AGENT_GENERAL_PROMPT,
          general_tools: [
            {
              type: "end_call",
              name: "end_call_1",
              description:
                "Only end the call if the user explicitly says they want to end the interview AND confirms it when asked. Do not end for casual goodbye phrases during the conversation.",
            },
          ],
        });

        logger.info("Creating Retell agent for Lisa...");
        const newFirstAgent = await retellClient.agent.create({
          response_engine: { llm_id: newModel.llm_id, type: "retell-llm" },
          voice_id: "11labs-Chloe",
          agent_name: "Lisa",
        });

        logger.info("Lisa Retell agent created successfully", {
          agent_id: newFirstAgent.agent_id,
          agent_name: newFirstAgent.agent_name,
          llm_id: newModel.llm_id,
        });

        if (existingLisa) {
          // Update existing interviewer to preserve foreign key references in interviews
          logger.info(
            "Updating existing Lisa interviewer with new agent_id (preserving ID for existing interviews)...",
          );
          newInterviewer = await InterviewerService.updateInterviewerAgentId(
            existingLisa.id,
            newFirstAgent.agent_id,
          );
          logger.info("Lisa interviewer updated successfully", {
            interviewer_id: newInterviewer?.id,
            old_agent_id: existingLisa.agent_id,
            new_agent_id: newFirstAgent.agent_id,
          });
        } else {
          logger.info("Saving new Lisa interviewer to database...");
          newInterviewer = await InterviewerService.createInterviewer({
            agent_id: newFirstAgent.agent_id,
            ...INTERVIEWERS.LISA,
          });
          logger.info(
            "Lisa interviewer created successfully:",
            newInterviewer.id,
          );
        }
      } catch (error: any) {
        logger.error(
          "Error creating/updating Lisa interviewer:",
          error?.message || error,
        );
        console.error("Full error:", error);
        // Continue to try creating Bob even if Lisa fails
      }
    }

    // Create or update Bob
    {
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
                "Only end the call if the user explicitly says they want to end the interview AND confirms it when asked. Do not end for casual goodbye phrases during the conversation.",
            },
          ],
        });

        logger.info("Creating Retell agent for Bob...");
        const newSecondAgent = await retellClient.agent.create({
          response_engine: { llm_id: newModel.llm_id, type: "retell-llm" },
          voice_id: "11labs-Brian",
          agent_name: "Bob",
        });

        logger.info("Bob Retell agent created successfully", {
          agent_id: newSecondAgent.agent_id,
          agent_name: newSecondAgent.agent_name,
          llm_id: newModel.llm_id,
        });

        if (existingBob) {
          // Update existing interviewer to preserve foreign key references in interviews
          logger.info(
            "Updating existing Bob interviewer with new agent_id (preserving ID for existing interviews)...",
          );
          newSecondInterviewer =
            await InterviewerService.updateInterviewerAgentId(
              existingBob.id,
              newSecondAgent.agent_id,
            );
          logger.info("Bob interviewer updated successfully", {
            interviewer_id: newSecondInterviewer?.id,
            old_agent_id: existingBob.agent_id,
            new_agent_id: newSecondAgent.agent_id,
          });
        } else {
          logger.info("Saving new Bob interviewer to database...");
          newSecondInterviewer = await InterviewerService.createInterviewer({
            agent_id: newSecondAgent.agent_id,
            ...INTERVIEWERS.BOB,
          });
          logger.info(
            "Bob interviewer created successfully:",
            newSecondInterviewer.id,
          );
        }
      } catch (error: any) {
        logger.error(
          "Error creating/updating Bob interviewer:",
          error?.message || error,
        );
        console.error("Full error:", error);
      }
    }

    // Verify agents exist in Retell by retrieving them
    let lisaAgentVerified = null;
    let bobAgentVerified = null;

    if (newInterviewer?.agent_id) {
      try {
        lisaAgentVerified = await retellClient.agent.retrieve(
          newInterviewer.agent_id,
        );
        logger.info("Lisa agent verified in Retell", {
          agent_id: newInterviewer.agent_id,
          agent_name: lisaAgentVerified?.agent_name,
        });
      } catch (error: any) {
        logger.error("Could not verify Lisa agent in Retell", {
          agent_id: newInterviewer.agent_id,
          error: error?.message,
        });
      }
    }

    if (newSecondInterviewer?.agent_id) {
      try {
        bobAgentVerified = await retellClient.agent.retrieve(
          newSecondInterviewer.agent_id,
        );
        logger.info("Bob agent verified in Retell", {
          agent_id: newSecondInterviewer.agent_id,
          agent_name: bobAgentVerified?.agent_name,
        });
      } catch (error: any) {
        logger.error("Could not verify Bob agent in Retell", {
          agent_id: newSecondInterviewer.agent_id,
          error: error?.message,
        });
      }
    }

    return NextResponse.json(
      {
        newInterviewer,
        newSecondInterviewer,
        message: "Interviewers created successfully",
        agentVerification: {
          lisa: lisaAgentVerified
            ? {
                agent_id: lisaAgentVerified.agent_id,
                agent_name: lisaAgentVerified.agent_name,
                verified: true,
              }
            : { verified: false, error: "Could not verify agent" },
          bob: bobAgentVerified
            ? {
                agent_id: bobAgentVerified.agent_id,
                agent_name: bobAgentVerified.agent_name,
                verified: true,
              }
            : { verified: false, error: "Could not verify agent" },
        },
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
