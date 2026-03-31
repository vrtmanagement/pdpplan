"use client";

import SelectionStepPage from "@/components/SelectionStepPage";
import { useFormState } from "@/components/form-context";

export default function Step3Page() {
  const { formState } = useFormState();

  return (
    <SelectionStepPage
      stateKey="drivingForces"
      title={`Step 3: ${formState.sectionTitles.drivingForces}`}
      subtitle="Select up to 4 items."
      availableTitle={`Available ${formState.sectionTitles.drivingForces}`}
      selectedTitle={`Selected ${formState.sectionTitles.drivingForces}`}
      items={formState.elementItems.drivingForces}
      maxSelections={4}
      backHref="/form/step2"
      nextHref="/form/step4"
    />
  );
}
