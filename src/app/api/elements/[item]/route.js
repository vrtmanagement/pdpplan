import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { readState, writeState } from "@/lib/server/state-repo";

export async function PUT(request, context) {
  const isAuthed = await getSession();
  if (!isAuthed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const item = decodeURIComponent(context.params.item);
  const body = await request.json().catch(() => ({}));
  const { explanation } = body;

  if (!item || !explanation) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const state = await readState();
  const next = {
    ...state,
    itemExplanationOverrides: {
      ...state.itemExplanationOverrides,
      [item]: explanation,
    },
    itemExplanations: {
      ...state.itemExplanations,
      [item]: {
        ...(state.itemExplanations?.[item] || {}),
        ...explanation,
      },
    },
    itemDescriptions: {
      ...state.itemDescriptions,
      [item]: explanation.definition || "",
    },
  };

  const saved = await writeState(next);
  return NextResponse.json({ state: saved });
}

