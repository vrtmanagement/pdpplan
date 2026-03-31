import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { readState, writeState } from "@/lib/server/state-repo";

const VALID_KEYS = ["dna25", "drivingForces", "behavioralTraits"];

function removeFromSelections(state, name) {
  return {
    ...state,
    dna25: state.dna25.filter((item) => item !== name),
    drivingForces: state.drivingForces.filter((item) => item !== name),
    behavioralTraits: state.behavioralTraits.filter((item) => item !== name),
  };
}

export async function GET() {
  const isAuthed = await getSession();
  if (!isAuthed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const state = await readState();
  return NextResponse.json({ elementItems: state.elementItems });
}

export async function POST(request) {
  const isAuthed = await getSession();
  if (!isAuthed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { groupKey, name, definition = "" } = body;

  if (!VALID_KEYS.includes(groupKey) || !name?.trim()) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const state = await readState();
  if (state.elementItems[groupKey].includes(name.trim())) {
    return NextResponse.json({ message: "Element already exists" }, { status: 409 });
  }

  const next = {
    ...state,
    elementItems: {
      ...state.elementItems,
      [groupKey]: [...state.elementItems[groupKey], name.trim()],
    },
    itemDescriptions: {
      ...state.itemDescriptions,
      [name.trim()]: definition,
    },
    itemExplanations: {
      ...state.itemExplanations,
      [name.trim()]: {
        definition,
        instruction: "",
        effortLevels: [],
        behavioralIndicators: [],
        developmentStrategies: [],
        reflectionQuestions: [],
      },
    },
    itemAliases: {
      ...state.itemAliases,
      [name.trim()]: name.trim(),
    },
  };
  const saved = await writeState(next);
  return NextResponse.json({ state: saved });
}

export async function DELETE(request) {
  const isAuthed = await getSession();
  if (!isAuthed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { name } = body;
  if (!name?.trim()) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  const target = name.trim();
  const state = await readState();
  const next = removeFromSelections(
    {
      ...state,
      elementItems: {
        dna25: state.elementItems.dna25.filter((item) => item !== target),
        drivingForces: state.elementItems.drivingForces.filter(
          (item) => item !== target
        ),
        behavioralTraits: state.elementItems.behavioralTraits.filter(
          (item) => item !== target
        ),
      },
      itemDescriptions: Object.fromEntries(
        Object.entries(state.itemDescriptions).filter(([k]) => k !== target)
      ),
      itemExplanations: Object.fromEntries(
        Object.entries(state.itemExplanations || {}).filter(([k]) => k !== target)
      ),
      itemAliases: Object.fromEntries(
        Object.entries(state.itemAliases).filter(([k]) => k !== target)
      ),
      itemExplanationOverrides: Object.fromEntries(
        Object.entries(state.itemExplanationOverrides).filter(([k]) => k !== target)
      ),
    },
    target
  );

  const saved = await writeState(next);
  return NextResponse.json({ state: saved });
}

