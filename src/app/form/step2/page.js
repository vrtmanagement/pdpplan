"use client";

import SelectionStepPage from "@/components/SelectionStepPage";
import { useFormState } from "@/components/form-context";

export default function Step2Page() {
  const { formState } = useFormState();

  return (
    <SelectionStepPage
      stateKey="dna25"
      title={`Step 2: ${formState.sectionTitles.dna25} Selection`}
      subtitle="Select up to 7 items. Click an item to move it to the selected panel."
      availableTitle={`Available ${formState.sectionTitles.dna25}`}
      selectedTitle={`Selected ${formState.sectionTitles.dna25}`}
      items={formState.elementItems.dna25}
      maxSelections={7}
      backHref="/form/step1"
      nextHref="/form/step3"
    />
  );
}
