"use client";

import { FormProvider } from "@/components/form-context";

export default function FormLayout({ children }) {
  return <FormProvider>{children}</FormProvider>;
}
