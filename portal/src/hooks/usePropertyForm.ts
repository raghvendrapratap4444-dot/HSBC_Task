"use client";

import { useMemo, useState } from "react";
import { emptyPropertyForm, propertySchema, type PropertyFormValues } from "@/lib/validation";

export function usePropertyForm(initial: PropertyFormValues = emptyPropertyForm) {
  const [values, setValues] = useState<PropertyFormValues>(initial);
  const [touched, setTouched] = useState<Partial<Record<keyof PropertyFormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const parsed = useMemo(() => propertySchema.safeParse(values), [values]);
  const errors = parsed.success ? {} : parsed.error.flatten().fieldErrors;

  function setField<K extends keyof PropertyFormValues>(name: K, value: PropertyFormValues[K]) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function touch(name: keyof PropertyFormValues) {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function fieldError(name: keyof PropertyFormValues) {
    if (!submitAttempted && !touched[name]) return undefined;
    return errors[name]?.[0];
  }

  function validate() {
    setSubmitAttempted(true);
    return propertySchema.safeParse(values);
  }

  function reset(next: PropertyFormValues = emptyPropertyForm) {
    setValues(next);
    setTouched({});
    setSubmitAttempted(false);
  }

  return { values, setField, touch, fieldError, validate, reset, isValid: parsed.success };
}
