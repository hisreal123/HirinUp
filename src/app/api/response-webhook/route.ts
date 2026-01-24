import { NextRequest, NextResponse } from "next/server";
import { Retell } from "retell-sdk";

const apiKey = process.env.RETELL_API_KEY || "";
const baseUrl = process.env.NEXT_PUBLIC_LIVE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (
    !Retell.verify(
      JSON.stringify(body),
      apiKey,
      req.headers.get("x-retell-signature") as string,
    )
  ) {
    console.error("Invalid signature");

    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { event, call } = body as { event: string; call: any };

  switch (event) {
    case "call_started":
      console.log("Call started event received", call.call_id);
      break;
    case "call_ended":
      console.log("Call ended event received", call.call_id);
      break;
    case "call_analyzed":
      try {
        console.log("Call analyzed event received, fetching call details:", call.call_id);
        const result = await fetch(`${baseUrl}/api/get-call`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: call.call_id,
          }),
        });
        
        if (!result.ok) {
          const errorText = await result.text();
          console.error("Failed to fetch call details:", {
            status: result.status,
            statusText: result.statusText,
            error: errorText,
            call_id: call.call_id,
          });
        } else {
          const data = await result.json();
          console.log("Successfully fetched and saved call details:", {
            call_id: call.call_id,
            hasCallResponse: !!data.callResponse,
            hasAnalytics: !!data.analytics,
          });
        }
      } catch (error) {
        console.error("Error calling get-call API:", {
          error,
          call_id: call.call_id,
          message: error instanceof Error ? error.message : String(error),
        });
      }
      break;
    default:
      console.log("Received an unknown event:", event);
  }

  // Acknowledge the receipt of the event
  return NextResponse.json({ status: 204 });
}
