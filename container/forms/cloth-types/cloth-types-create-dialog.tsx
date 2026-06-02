"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { PlusIcon, XIcon } from "lucide-react";
import {
  postCatalogClothesByStoreIdMutation,
  getCatalogClothesQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import z from "zod";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

const CLOTH_TYPES = [
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

interface StagedItem {
  name: string;
  type: string;
  price: string;
}

const draftSchema = z.object({
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

export function ClothTypesCreateDialog() {
  const { selectedStoreId } = useSelectedStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<StagedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createClothType, isPending: isSubmitting } = useMutation(
    {
      ...postCatalogClothesByStoreIdMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getCatalogClothesQueryKey(),
        });
        resetForm();
      },
    },
  );

  const form = useForm({
    defaultValues: { name: "", type: "", price: "" },
    validators: { onChange: draftSchema },
    onSubmit: async ({ value }) => {
      setItems((prev) => [...prev, { ...value }]);
      form.reset();
      setError(null);
    },
  });

  function resetForm() {
    setOpen(false);
    setItems([]);
    form.reset();
    setError(null);
  }

  function removeFromItems(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (items.length === 0) {
      setError("Add at least one cloth type");
      return;
    }
    if (!selectedStoreId) return;

    await createClothType({
      path: { storeId: selectedStoreId },
      body: items.map((item) => ({
        name: item.name.trim(),
        type: item.type,
        price: Number(item.price),
      })),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Cloth Types
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Cloth Types</DialogTitle>
          <DialogDescription>
            Add cloth types available in your store
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="rounded-lg border p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Cloth Name</FieldLabel>
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Cotton Shirt"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="type">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
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
                  );
                }}
              </form.Field>
            </div>

            <form.Field name="price">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Price (KES)</FieldLabel>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. 150"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            </form.Field>

            <form.Subscribe>
              {({ isSubmitting: formSubmitting }) => (
                <Button
                  type="submit"
                  variant="outline"
                  disabled={formSubmitting}
                  className="w-full"
                >
                  <PlusIcon className="size-4 mr-2" />
                  Add Cloth Type
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>

        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Staged Items ({items.length})
            </p>
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromItems(index)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <XIcon className="size-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {item.type}
                      </span>
                      <span className="text-sm font-semibold">
                        KES {Number(item.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <form.Subscribe>
          {({ isSubmitting: formSubmitting }) => (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={items.length === 0 || isSubmitting || formSubmitting}
              className="w-full"
            >
              {isSubmitting && <Spinner />}
              Save {items.length} Item{items.length !== 1 ? "s" : ""}
            </Button>
          )}
        </form.Subscribe>
      </DialogContent>
    </Dialog>
  );
}
