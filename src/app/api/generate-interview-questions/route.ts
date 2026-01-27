import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import {
  SYSTEM_PROMPT,
  generateQuestionsPrompt,
} from "@/lib/prompts/generate-questions";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

export async function POST(req: Request) {
  logger.info("generate-interview-questions request received");

  try {
    const body = await req.json();
    logger.info("Request body received:", JSON.stringify(body));

    // Validate required fields
    if (!body.name || !body.objective || !body.number) {
      logger.error("Missing required fields:", body);
      return NextResponse.json(
        { error: "Missing required fields: name, objective, and number are required" },
        { status: 400 },
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      logger.error("OPENAI_API_KEY is not configured");
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 },
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 5,
      dangerouslyAllowBrowser: true,
    });

    const prompt = generateQuestionsPrompt(body);
    logger.info(`Generated prompt length: ${prompt.length}`);

    const baseCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const basePromptOutput = baseCompletion.choices[0] || {};
    const content = basePromptOutput.message?.content;

    if (!content) {
      logger.error("No content in OpenAI response");
      return NextResponse.json(
        { error: "No content received from OpenAI" },
        { status: 500 },
      );
    }

    // Log the response for debugging
    logger.info("Interview questions generated successfully");
    logger.info(`Response content length: ${content.length}`);
    
    // Try to parse and validate the JSON structure
    try {
      const parsedContent = JSON.parse(content);
      if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
        logger.error("Invalid response structure from OpenAI:", parsedContent);
        return NextResponse.json(
          { 
            error: "Invalid response structure from OpenAI",
            details: "Response missing 'questions' array"
          },
          { status: 500 },
        );
      }
      logger.info(`Successfully generated ${parsedContent.questions.length} questions`);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      logger.error("Failed to parse OpenAI response as JSON:", errorMessage);
      // Still return the content, let frontend handle parsing
    }

    return NextResponse.json(
      {
        response: content,
        success: true,
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error("Error generating interview questions:", error?.message || error);
    console.error("Full error:", error);

    // Check if it's a quota/billing error
    const isQuotaError = 
      error?.message?.includes("429") ||
      error?.message?.includes("quota") ||
      error?.message?.includes("billing") ||
      error?.code === "insufficient_quota" ||
      error?.status === 429;

    if (isQuotaError) {
      return NextResponse.json(
        {
          error: "OpenAI API quota exceeded",
          details: error?.message || "You exceeded your current quota, please check your plan and billing details.",
          docs: "https://platform.openai.com/docs/guides/error-codes/api-errors",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error: "internal server error",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
