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
        const result = await fetch(`${baseUrl}/api/get-call`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: call.call_id,
          }),
        });
        console.log("Call analyzed event received", call.call_id);
      } catch (error) {
        console.error("Error calling get-call API:", error);
      }
      break;
    default:
      console.log("Received an unknown event:", event);
  }

  // Acknowledge the receipt of the event
  return NextResponse.json({ status: 204 });
}
