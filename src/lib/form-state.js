export function createInitialFormState() {
  return {
    user: {
      name: "",
      company: "",
      position: "",
      reportDate: "",
    },
    dna25: [],
    drivingForces: [],
    behavioralTraits: [],
    sectionTitles: {
      dna25: "Competencies (DNA25)",
      drivingForces: "Driving Forces",
      behavioralTraits: "Behaviour",
    },
    elementItems: {
      dna25: [],
      drivingForces: [],
      behavioralTraits: [],
    },
    itemDescriptions: {},
    itemExplanations: {},
    itemExplanationOverrides: {},
    itemAliases: {},
  };
}

export function normalizeFormState(input = {}) {
  const base = createInitialFormState();
  const mergedItems = {
    ...base.elementItems,
    ...(input.elementItems || {}),
  };
  const storedAliases =
    input.itemAliases && Object.keys(input.itemAliases).length
      ? input.itemAliases
      : Object.keys(mergedItems).reduce((acc, key) => {
          (mergedItems[key] || []).forEach((item, idx) => {
            acc[item] = item;
          });
          return acc;
        }, {});

  return {
    ...base,
    ...input,
    user: {
      ...base.user,
      ...(input.user || {}),
    },
    sectionTitles: {
      ...base.sectionTitles,
      ...(input.sectionTitles || {}),
    },
    elementItems: mergedItems,
    itemAliases: storedAliases,
    itemDescriptions: input.itemDescriptions || {},
    itemExplanations: input.itemExplanations || {},
    itemExplanationOverrides: input.itemExplanationOverrides || {},
  };
}

