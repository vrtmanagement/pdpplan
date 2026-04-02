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

function preferNonEmpty(currentValue, fallbackValue) {
  if (Array.isArray(currentValue)) {
    return currentValue.length ? currentValue : fallbackValue;
  }
  if (typeof currentValue === "string") {
    return currentValue.trim() ? currentValue : fallbackValue;
  }
  if (currentValue && typeof currentValue === "object") {
    return Object.keys(currentValue).length ? currentValue : fallbackValue;
  }
  return currentValue ?? fallbackValue;
}

function mergeExplanation(seedEntry = {}, currentEntry = {}) {
  return {
    ...seedEntry,
    ...currentEntry,
    definition: preferNonEmpty(currentEntry.definition, seedEntry.definition || ""),
    instruction: preferNonEmpty(currentEntry.instruction, seedEntry.instruction || ""),
    effortLevels: preferNonEmpty(currentEntry.effortLevels, seedEntry.effortLevels || []),
    behavioralIndicators: preferNonEmpty(
      currentEntry.behavioralIndicators,
      seedEntry.behavioralIndicators || []
    ),
    developmentStrategies: preferNonEmpty(
      currentEntry.developmentStrategies,
      seedEntry.developmentStrategies || []
    ),
    reflectionQuestions: preferNonEmpty(
      currentEntry.reflectionQuestions,
      seedEntry.reflectionQuestions || []
    ),
  };
}

export async function readState() {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ _id: DOC_ID });
  const normalized = normalizeFormState(doc?.state || {});
  const seeded = buildSeedState();
  const isEmpty =
    !normalized.elementItems.dna25.length &&
    !normalized.elementItems.drivingForces.length &&
    !normalized.elementItems.behavioralTraits.length;
  const missingExplanations = !Object.keys(normalized.itemExplanations || {}).length;

  if (!doc || isEmpty || missingExplanations) {
    await db.collection(COLLECTION).updateOne(
      { _id: DOC_ID },
      { $set: { state: seeded, updatedAt: new Date() } },
      { upsert: true }
    );
    return seeded;
  }
  const legacyPeopleOriented = normalized.itemExplanations?.["People-Oriented"] || {};
  const mergedExplanations = { ...normalized.itemExplanations };
  Object.keys(seeded.itemExplanations || {}).forEach((item) => {
    const current =
      item === "People Oriented"
        ? {
            ...legacyPeopleOriented,
            ...(normalized.itemExplanations?.[item] || {}),
          }
        : normalized.itemExplanations?.[item] || {};
    mergedExplanations[item] = mergeExplanation(
      seeded.itemExplanations[item] || {},
      current
    );
  });
  delete mergedExplanations["People-Oriented"];

  const mergedDescriptions = {
    ...normalized.itemDescriptions,
  };
  Object.keys(seeded.itemDescriptions || {}).forEach((item) => {
    if (!mergedDescriptions[item]?.trim()) {
      mergedDescriptions[item] = seeded.itemDescriptions[item];
    }
  });

  const mergedState = normalizeFormState({
    ...normalized,
    itemDescriptions: mergedDescriptions,
    itemExplanations: mergedExplanations,
  });
  await db.collection(COLLECTION).updateOne(
    { _id: DOC_ID },
    { $set: { state: mergedState, updatedAt: new Date() } },
    { upsert: true }
  );
  return mergedState;
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

