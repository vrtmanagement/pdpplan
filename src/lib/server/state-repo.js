import { getDb } from "@/lib/server/mongodb";
import { normalizeFormState } from "@/lib/form-state";
import {
  BEHAVIORAL_TRAITS_ITEMS,
  DNA25_ITEMS,
  DRIVING_FORCES_ITEMS,
  ITEM_DESCRIPTIONS,
  ITEM_EXPLANATIONS,
} from "@/lib/data";
import { DOCX_ITEM_EXPLANATIONS } from "@/lib/docx-item-explanations";

const COLLECTION = "appState";
const DOC_ID = "default";

function buildSeedState() {
  const itemExplanations = {
    ...ITEM_EXPLANATIONS,
    ...DOCX_ITEM_EXPLANATIONS,
  };
  const itemDescriptions = Object.fromEntries(
    Object.keys(itemExplanations).map((item) => [
      item,
      itemExplanations[item]?.definition || ITEM_DESCRIPTIONS[item] || "",
    ])
  );

  return normalizeFormState({
    elementItems: {
      dna25: [...DNA25_ITEMS],
      drivingForces: [...DRIVING_FORCES_ITEMS],
      behavioralTraits: [...BEHAVIORAL_TRAITS_ITEMS],
    },
    itemDescriptions,
    itemExplanations,
    itemAliases: Object.fromEntries(
      [...DNA25_ITEMS, ...DRIVING_FORCES_ITEMS, ...BEHAVIORAL_TRAITS_ITEMS].map(
        (item) => [item, item]
      )
    ),
  });
}

export async function readState() {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ _id: DOC_ID });
  const normalized = normalizeFormState(doc?.state || {});
  const isEmpty =
    !normalized.elementItems.dna25.length &&
    !normalized.elementItems.drivingForces.length &&
    !normalized.elementItems.behavioralTraits.length;
  const missingExplanations = !Object.keys(normalized.itemExplanations || {}).length;

  if (!doc || isEmpty || missingExplanations) {
    const seeded = buildSeedState();
    await db.collection(COLLECTION).updateOne(
      { _id: DOC_ID },
      { $set: { state: seeded, updatedAt: new Date() } },
      { upsert: true }
    );
    return seeded;
  }

  return normalized;
}

export async function writeState(nextState) {
  const db = await getDb();
  const normalized = normalizeFormState(nextState);
  await db.collection(COLLECTION).updateOne(
    { _id: DOC_ID },
    { $set: { state: normalized, updatedAt: new Date() } },
    { upsert: true }
  );
  return normalized;
}

