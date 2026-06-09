"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload";
import { useForm } from "@tanstack/react-form";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import z from "zod";

export interface CatalogStagedItem {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  services: string;
  bulk: boolean;
}

export const catalogDraftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required").refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    "Price must be a positive number",
  ),
  imageUrl: z.string().min(1, "Image is required"),
  services: z.string(),
  bulk: z.boolean(),
});

export function cloneCatalogItem(item: CatalogStagedItem): CatalogStagedItem {
  return { ...item };
}

export function emptyCatalogItem(): CatalogStagedItem {
  return {
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    services: "",
    bulk: false,
  };
}

export function isValidCatalogItem(item: CatalogStagedItem): boolean {
  return (
    item.name.trim() !== "" &&
    item.description.trim() !== "" &&
    item.price.trim() !== "" &&
    !isNaN(Number(item.price)) &&
    Number(item.price) > 0
  );
}

interface CatalogItemFieldsProps {
  onSubmit: (value: CatalogStagedItem) => void;
}


export function CatalogItemFields({
  onSubmit,
}: CatalogItemFieldsProps) {
  const form = useForm({
    defaultValues: emptyCatalogItem(),
    validators: { onChange: catalogDraftSchema },
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
      <div className="space-y-3">
        <form.Field name="imageUrl">
          {(field) => (
            <div className="flex justify-center">
              <CloudinaryUpload
                value={field.state.value}
                onChange={(url) => field.handleChange(url)}
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field name="name">
            {(field) => (
              <Field data-invalid={!!field.state.meta.errors?.length}>
                <FieldLabel>Item Name</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. Wash & Fold"
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
                  placeholder="e.g. 500"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </div>

        <form.Field name="description">
          {(field) => (
            <Field data-invalid={!!field.state.meta.errors?.length}>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Brief description of this item"
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <form.Field name="services">
            {(field) => (
              <Field className="col-span-2">
                <FieldLabel>Services</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. washing, ironing, folding"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate services with commas
                </p>
              </Field>
            )}
          </form.Field>

          <form.Field name="bulk">
            {(field) => (
              <Field>
                <FieldLabel>Billing Type</FieldLabel>
                <div className="flex h-9 items-center">
                  <button
                    type="button"
                    onClick={() => field.handleChange(!field.state.value)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      field.state.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:border-primary"
                    }`}
                  >
                    {field.state.value ? "Per Kg" : "Per Item"}
                  </button>
                </div>
              </Field>
            )}
          </form.Field>
        </div>
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
            Add Catalog
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
