import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { readState, writeState } from "@/lib/server/state-repo";

export async function GET() {
  const isAuthed = await getSession();
  if (!isAuthed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const state = await readState();
  return NextResponse.json({ state });
}

export async function PUT(request) {
  const isAuthed = await getSession();
  if (!isAuthed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const state = await writeState(body.state || {});
  return NextResponse.json({ state });
}

