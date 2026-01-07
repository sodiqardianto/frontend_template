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
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/components/ui/combobox";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface FormComboboxProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  description?: string;
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Value that should be converted to null when selected */
  nullValue?: string;
}

/**
 * Reusable form combobox field with search functionality (single select)
 * Wraps react-hook-form FormField with Combobox
 */
export function FormCombobox<TFieldValues extends FieldValues>({
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
  nullValue,
}: FormComboboxProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Handle null value mapping
        const currentValue = field.value === null && nullValue 
          ? nullValue 
          : field.value;
        const selectedOption = options.find((opt) => opt.value === currentValue) || null;

        return (
          <FormItem className={className}>
            <FormLabel>
              {label} {required && <span className="text-destructive">*</span>}
            </FormLabel>
            <FormControl>
              <Combobox
                value={selectedOption}
                onValueChange={(value: ComboboxOption | null) => {
                  // Convert nullValue back to null
                  const newValue = value?.value === nullValue ? null : (value?.value || undefined);
                  field.onChange(newValue);
                }}
                items={options}
                disabled={disabled}
              >
                <ComboboxInput
                  placeholder={placeholder}
                  showClear
                  className={cn(
                    fieldState.error && "border-destructive! focus-visible:ring-destructive!"
                  )}
                />
                <ComboboxPopup container={containerRef?.current}>
                  <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                  <ComboboxList>
                    {(item: ComboboxOption) => (
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
