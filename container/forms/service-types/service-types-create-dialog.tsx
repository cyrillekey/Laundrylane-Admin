"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { PlusIcon, XIcon } from "lucide-react";
import { postCatalogServiceTypesByStoreIdMutation, getCatalogServiceTypesQueryKey } from "@/queries/@tanstack/react-query.gen";
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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import z from "zod";

interface StagedItem {
  name: string;
  description: string;
  price: string;
  serviceTimelines: string;
}

const draftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.string().min(1, "Price is required").refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    "Price must be a positive number",
  ),
  serviceTimelines: z.string().min(1, "Timeline is required"),
});

export function ServiceTypesCreateDialog() {
  const { selectedStoreId } = useSelectedStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<StagedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createServiceType, isPending: isSubmitting } = useMutation({
    ...postCatalogServiceTypesByStoreIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCatalogServiceTypesQueryKey() });
      resetForm();
    },
  });

  const form = useForm({
    defaultValues: { name: "", description: "", price: "", serviceTimelines: "" },
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
      setError("Add at least one service type");
      return;
    }
    if (!selectedStoreId) return;

    await createServiceType({
      path: { storeId: selectedStoreId },
      body: items.map((item) => ({
        name: item.name.trim(),
        description: item.description.trim(),
        price: Number(item.price),
        serviceTimelines: item.serviceTimelines.trim(),
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Service Types
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Service Types</DialogTitle>
          <DialogDescription>
            Add service types available in your store
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
                      <FieldLabel>Service Name</FieldLabel>
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Washing"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  );
                }}
              </form.Field>

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
                        placeholder="e.g. 500"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Brief description of this service"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="serviceTimelines">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Service Timeline</FieldLabel>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. 2-3 hours"
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
                  Add Service Type
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
            <div className="grid gap-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => removeFromItems(index)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <XIcon className="size-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.description || "—"}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">
                        KES {Number(item.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.serviceTimelines}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

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
