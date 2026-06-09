"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useForm } from "@tanstack/react-form";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import z from "zod";

export const CLOTH_TYPES = [
  "Shirt",
  "T-Shirt",
  "Casual",
  "Dress",
  "Suits",
  "Trouser",
  "Jeans",
  "Jacket",
  "Coat",
  "Hoodie",
  "Sweater",
  "Shorts",
  "Skirt",
  "Blouse",
  "Traditional",
  "Uniform",
  "Other",
];

export interface ClothTypeStagedItem {
  name: string;
  type: string;
  price: string;
}

export const clothTypeDraftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Price must be a positive number",
    ),
});

export function emptyClothTypeItem(): ClothTypeStagedItem {
  return { name: "", type: "", price: "" };
}

export function isValidClothTypeItem(item: ClothTypeStagedItem): boolean {
  return (
    item.name.trim() !== "" &&
    item.type !== "" &&
    item.price.trim() !== "" &&
    !isNaN(Number(item.price)) &&
    Number(item.price) > 0
  );
}

interface ClothTypeItemFieldsProps {
  onSubmit: (value: ClothTypeStagedItem) => void;
}

export function ClothTypeItemFields({
  onSubmit,
}: ClothTypeItemFieldsProps) {
  const form = useForm({
    defaultValues: emptyClothTypeItem(),
    validators: { onChange: clothTypeDraftSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value);
      form.reset();
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field name="name">
            {(field) => (
              <Field data-invalid={!!field.state.meta.errors?.length}>
                <FieldLabel>Cloth Name</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. Cotton Shirt"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="type">
            {(field) => (
              <Field data-invalid={!!field.state.meta.errors?.length}>
                <FieldLabel>Type</FieldLabel>
                <NativeSelect
                  name="type"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  {CLOTH_TYPES.map((type) => (
                    <NativeSelectOption key={type} value={type}>
                      {type}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </div>

        <form.Field name="price">
          {(field) => (
            <Field data-invalid={!!field.state.meta.errors?.length}>
              <FieldLabel>Price (KES)</FieldLabel>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="e.g. 150"
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>
      </div>

      <form.Subscribe>
        {({ isSubmitting }) => (
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting}
            className="w-full"
          >
            <PlusIcon className="size-4 mr-2" />
            Add Cloth Type
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
