import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { InterviewService } from "@/services/interviews.service";
import { logger } from "@/lib/logger";

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

export async function POST(req: Request) {
  try {
    const url_id = nanoid();
    const url = `${base_url}/join/${url_id}`;
    const body = await req.json();

    logger.info("create-interview request received");

    const payload = body.interviewData;

    let readableSlug = null;
    if (body.organizationName) {
      // Format: [organization_name] (just the org name, not combined with interview ID)
      // The URL will be: /join/[organization_name]/[interview_id]/[response_id]
      const orgNameSlug = body.organizationName
        ?.toLowerCase()
        .trim()
        .replace(/\s+/g, "-")  // Replace one or more spaces with single hyphen
        .replace(/[^a-z0-9-]/g, ""); // Remove special characters, keep only alphanumeric and hyphens
      readableSlug = orgNameSlug; // Just organization name for backward compatibility
    }

    const newInterview = await InterviewService.createInterview({
      ...payload,
      url: url,
      id: url_id,
      readable_slug: readableSlug,
    });

    logger.info("Interview created successfully");

    return NextResponse.json(
      { response: "Interview created successfully" },
      { status: 200 },
    );
  } catch (err) {
    logger.error("Error creating interview");

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
