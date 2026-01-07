"use client";

import * as React from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxValue,
} from "@/components/ui/combobox";

export interface MultiComboboxOption {
  value: string;
  label: string;
}

interface FormMultiComboboxProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: MultiComboboxOption[];
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  description?: string;
  containerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Reusable form combobox field with search functionality (multi select)
 * Wraps react-hook-form FormField with Combobox multiple mode
 */
export function FormMultiCombobox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Select...",
  emptyMessage = "No results found.",
  disabled,
  className,
  required,
  description,
  containerRef,
}: FormMultiComboboxProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedOptions = options.filter((opt) =>
          (field.value as string[] | undefined)?.includes(opt.value)
        );

        return (
          <FormItem className={className}>
            <FormLabel>
              {label} {required && <span className="text-destructive">*</span>}
            </FormLabel>
            <FormControl>
              <Combobox
                value={selectedOptions}
                onValueChange={(values: MultiComboboxOption[]) => {
                  field.onChange(values.map((v) => v.value));
                }}
                items={options}
                multiple
                disabled={disabled}
              >
                <ComboboxChips
                  className={cn(
                    fieldState.error && "border-destructive! focus-visible:ring-destructive!"
                  )}
                >
                  <ComboboxValue>
                    {(value: MultiComboboxOption[]) => (
                      <>
                        {value?.map((item) => (
                          <ComboboxChip aria-label={item.label} key={item.value}>
                            {item.label}
                          </ComboboxChip>
                        ))}
                        <ComboboxInput
                          aria-label={label}
                          placeholder={value.length > 0 ? undefined : placeholder}
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxPopup container={containerRef?.current}>
                  <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                  <ComboboxList>
                    {(item: MultiComboboxOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxPopup>
              </Combobox>
            </FormControl>
            {description && <FormDescription className="text-xs">{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
