import type { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { ApiException } from "./client";

interface HandleFormErrorOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  onGeneralError: (message: string) => void;
  networkErrorMessage?: string;
}

/**
 * Handle API errors and map them to form fields automatically
 * Field errors are set on the form, unknown fields go to general error
 */
export function handleFormError<T extends FieldValues>(
  error: unknown,
  options: HandleFormErrorOptions<T>
): void {
  const { form, onGeneralError, networkErrorMessage = "Network error. Please try again." } = options;

  if (!(error instanceof ApiException)) {
    onGeneralError(networkErrorMessage);
    return;
  }

  if (!error.details?.length) {
    onGeneralError(error.message);
    return;
  }

  // Get registered field names from form
  const formFields = Object.keys(form.getValues()) as Path<T>[];

  error.details.forEach((detail) => {
    const fieldName = detail.field as Path<T>;
    
    if (formFields.includes(fieldName)) {
      form.setError(fieldName, { message: detail.message });
    } else {
      onGeneralError(detail.message);
    }
  });
}
