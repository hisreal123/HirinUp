import { NextResponse } from "next/server";

function isAllowed(email: string): boolean {
  const allow = (process.env.ALLOWLIST_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return allow.includes(email.trim().toLowerCase());
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    return NextResponse.json({ ok: isAllowed(email) });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
