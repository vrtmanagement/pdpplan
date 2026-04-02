export const ELEMENT_GROUP_META = [
  {
    key: "dna25",
    label: "Competencies (DNA25)",
    blurb: "Competency dimensions",
    chipClass: "bg-rose-100 text-rose-800 ring-rose-200/60",
    accentClass: "from-rose-500/15 to-amber-500/10",
  },
  {
    key: "behavioralTraits",
    label: "Behaviour",
    blurb: "Behavioral traits",
    chipClass: "bg-violet-100 text-violet-800 ring-violet-200/60",
    accentClass: "from-violet-500/15 to-indigo-500/10",
  },
  {
    key: "drivingForces",
    label: "Driving Forces",
    blurb: "Motivators",
    chipClass: "bg-sky-100 text-sky-900 ring-sky-200/60",
    accentClass: "from-sky-500/15 to-cyan-500/10",
  },
];

export function elementDetailHref(item) {
  return `/form/elements/${encodeURIComponent(item)}`;
}

export function getResolvedElementExplanation(item, formState) {
  const baseFromDb = formState.itemExplanations?.[item] || {};
  const base = {
    definition: formState.itemDescriptions?.[item] || "",
    instruction: "",
    effortLevels: [],
    behavioralIndicators: [],
    developmentStrategies: [],
    reflectionQuestions: [],
    ...baseFromDb,
  };
  const override = formState.itemExplanationOverrides?.[item] || {};
  return {
    ...base,
    ...override,
    definition: override.definition || base.definition || "",
  };
}

function toMultiline(items = []) {
  return items.join("\n");
}

export function toEffortLines(effortLevels = []) {
  return effortLevels.map((entry) => `${entry.level}::${entry.detail}`).join("\n");
}

function toArray(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseEffortLines(text) {
  return toArray(text).map((line) => {
    const splitIndex = line.indexOf("::");
    if (splitIndex < 0) {
      return { level: line, detail: "" };
    }
    return {
      level: line.slice(0, splitIndex).trim(),
      detail: line.slice(splitIndex + 2).trim(),
    };
  });
}

export function buildExplanationDraft(explanation) {
  return {
    definition: explanation.definition || "",
    instruction: explanation.instruction || "",
    effortLevels: toEffortLines(explanation.effortLevels || []),
    behavioralIndicators: toMultiline(explanation.behavioralIndicators || []),
    developmentStrategies: toMultiline(explanation.developmentStrategies || []),
    reflectionQuestions: toMultiline(explanation.reflectionQuestions || []),
  };
}

export function draftToSavedExplanation(draft, previousResolved) {
  return {
    ...previousResolved,
    definition: draft.definition,
    instruction: draft.instruction,
    effortLevels: parseEffortLines(draft.effortLevels),
    behavioralIndicators: toArray(draft.behavioralIndicators),
    developmentStrategies: toArray(draft.developmentStrategies),
    reflectionQuestions: toArray(draft.reflectionQuestions),
  };
}

export function findGroupKeyForItem(item, elementItems) {
  for (const meta of ELEMENT_GROUP_META) {
    if ((elementItems[meta.key] || []).includes(item)) {
      return meta.key;
    }
  }
  return null;
}

export function flattenAllElementNames(elementItems) {
  return ELEMENT_GROUP_META.flatMap((g) => elementItems[g.key] || []);
}
