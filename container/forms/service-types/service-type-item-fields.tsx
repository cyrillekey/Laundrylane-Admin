"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import z from "zod";

export interface ServiceTypeStagedItem {
  name: string;
  description: string;
  price: string;
  serviceTimelines: string;
}

export const serviceTypeDraftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.string().min(1, "Price is required").refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    "Price must be a positive number",
  ),
  serviceTimelines: z.string().min(1, "Timeline is required"),
});

export function emptyServiceTypeItem(): ServiceTypeStagedItem {
  return {
    name: "",
    description: "",
    price: "",
    serviceTimelines: "",
  };
}

export function isValidServiceTypeItem(item: ServiceTypeStagedItem): boolean {
  return (
    item.name.trim() !== "" &&
    item.price.trim() !== "" &&
    !isNaN(Number(item.price)) &&
    Number(item.price) >= 0 &&
    item.serviceTimelines.trim() !== ""
  );
}

interface ServiceTypeItemFieldsProps {
  onSubmit: (value: ServiceTypeStagedItem) => void;
}

export function ServiceTypeItemFields({
  onSubmit,
}: ServiceTypeItemFieldsProps) {
  const form = useForm({
    defaultValues: emptyServiceTypeItem(),
    validators: { onChange: serviceTypeDraftSchema },
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
                <FieldLabel>Service Name</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. Standard"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

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
                  placeholder="e.g. 200"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </div>

        <form.Field name="description">
          {(field) => (
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="e.g. Standard service turnaround"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="serviceTimelines">
          {(field) => (
            <Field data-invalid={!!field.state.meta.errors?.length}>
              <FieldLabel>Service Timeline</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="e.g. 2-3 hours"
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
            Add Service Type
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
