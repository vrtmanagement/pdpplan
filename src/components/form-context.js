"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createInitialFormState, normalizeFormState } from "@/lib/form-state";

const initialState = createInitialFormState();

const FormContext = createContext({
  formState: initialState,
  hydrated: false,
  persistError: "",
  setUser: () => {},
  addSelection: () => false,
  removeSelection: () => {},
  reorderSelection: () => {},
  updateElementsConfig: () => {},
  saveElementExplanation: async () => {},
  addElement: async () => {},
  deleteElement: async () => {},
  resetForm: async () => {},
});

function remapSelections(oldItems, newItems, selectedItems) {
  const indexQueues = oldItems.reduce((acc, item, idx) => {
    if (!acc[item]) {
      acc[item] = [];
    }
    acc[item].push(idx);
    return acc;
  }, {});

  return selectedItems
    .map((item) => {
      const queue = indexQueues[item];
      const idx = queue?.length ? queue.shift() : -1;
      if (idx >= 0 && idx < newItems.length) {
        return newItems[idx];
      }
      return newItems.includes(item) ? item : null;
    })
    .filter(Boolean);
}

export function FormProvider({ children }) {
  const [formState, setFormState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [persistError, setPersistError] = useState("");
  const skipNextPersistRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load state");
        }
        const payload = await response.json();
        setFormState(normalizeFormState(payload.state || {}));
      } catch {
        setFormState(initialState);
      } finally {
        setHydrated(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: formState }),
        });
        if (!response.ok) {
          throw new Error("save-failed");
        }
        setPersistError("");
      } catch {
        setPersistError("Unable to save changes to database");
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [formState, hydrated]);

  const value = useMemo(
    () => ({
      formState,
      hydrated,
      persistError,
      setUser: (user) => {
        setFormState((prev) => ({ ...prev, user: { ...prev.user, ...user } }));
      },
      addSelection: (key, item, limit) => {
        let added = false;
        setFormState((prev) => {
          const current = prev[key] || [];
          if (current.includes(item) || current.length >= limit) {
            return prev;
          }
          added = true;
          return { ...prev, [key]: [...current, item] };
        });
        return added;
      },
      removeSelection: (key, item) => {
        setFormState((prev) => ({
          ...prev,
          [key]: (prev[key] || []).filter((entry) => entry !== item),
        }));
      },
      reorderSelection: (key, fromIndex, toIndex) => {
        setFormState((prev) => {
          const current = [...(prev[key] || [])];
          if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= current.length ||
            toIndex >= current.length
          ) {
            return prev;
          }
          const [moved] = current.splice(fromIndex, 1);
          current.splice(toIndex, 0, moved);
          return { ...prev, [key]: current };
        });
      },
      updateElementsConfig: ({ sectionTitles, elementItems, itemDescriptions }) => {
        setFormState((prev) => {
          const nextElementItems = {
            dna25: [...(elementItems?.dna25 || prev.elementItems.dna25)],
            drivingForces: [
              ...(elementItems?.drivingForces || prev.elementItems.drivingForces),
            ],
            behavioralTraits: [
              ...(elementItems?.behavioralTraits ||
                prev.elementItems.behavioralTraits),
            ],
          };
          const nextAliases = {};
          const nextDescriptions = {};
          Object.keys(nextElementItems).forEach((key) => {
            nextElementItems[key].forEach((item) => {
              if (item) {
                const sourceName = item;
                nextAliases[item] = item;
                nextDescriptions[item] =
                  itemDescriptions?.[item] ??
                  prev.itemDescriptions?.[item] ??
                  prev.itemDescriptions?.[sourceName] ??
                  "";
              }
            });
          });

          return {
            ...prev,
            sectionTitles: {
              ...prev.sectionTitles,
              ...(sectionTitles || {}),
            },
            elementItems: nextElementItems,
            itemAliases: nextAliases,
            itemDescriptions: nextDescriptions,
            itemExplanations: prev.itemExplanations,
            itemExplanationOverrides: prev.itemExplanationOverrides,
            dna25: remapSelections(prev.elementItems.dna25, nextElementItems.dna25, prev.dna25),
            drivingForces: remapSelections(
              prev.elementItems.drivingForces,
              nextElementItems.drivingForces,
              prev.drivingForces
            ),
            behavioralTraits: remapSelections(
              prev.elementItems.behavioralTraits,
              nextElementItems.behavioralTraits,
              prev.behavioralTraits
            ),
          };
        });
      },
      saveElementExplanation: async (item, explanation) => {
        setFormState((prev) => ({
          ...prev,
          itemExplanationOverrides: {
            ...prev.itemExplanationOverrides,
            [item]: explanation,
          },
          itemDescriptions: {
            ...prev.itemDescriptions,
            [item]: explanation.definition || "",
          },
          itemExplanations: {
            ...prev.itemExplanations,
            [item]: {
              ...(prev.itemExplanations?.[item] || {}),
              ...explanation,
            },
          },
        }));
        const response = await fetch(`/api/elements/${encodeURIComponent(item)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ explanation }),
        });
        if (!response.ok) {
          throw new Error("Unable to save element");
        }
      },
      addElement: async (groupKey, name, definition = "") => {
        const response = await fetch("/api/elements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupKey, name, definition }),
        });
        if (!response.ok) {
          throw new Error("Unable to add element");
        }
        const payload = await response.json();
        setFormState(normalizeFormState(payload.state || {}));
      },
      deleteElement: async (name) => {
        const response = await fetch("/api/elements", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (!response.ok) {
          throw new Error("Unable to delete element");
        }
        const payload = await response.json();
        setFormState(normalizeFormState(payload.state || {}));
      },
      resetForm: async () => {
        // Prevent a stale debounced save from writing old step data after reset.
        skipNextPersistRef.current = true;
        setFormState(initialState);
        try {
          const response = await fetch("/api/state", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: initialState }),
          });
          if (!response.ok) {
            throw new Error("reset-save-failed");
          }
          setPersistError("");
        } catch {
          setPersistError("Unable to save changes to database");
        }
      },
    }),
    [formState, hydrated, persistError]
  );

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormState() {
  return useContext(FormContext);
}
