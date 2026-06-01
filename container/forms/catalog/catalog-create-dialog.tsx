"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, XIcon } from "lucide-react";
import { postCatalogByStoreIdMutation, getCatalogQueryKey } from "@/queries/@tanstack/react-query.gen";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload";
import { Badge } from "@/components/ui/badge";

interface CatalogItemEntry {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  services: string;
  bulk: boolean;
}

export function CatalogCreateDialog() {
  const { selectedStoreId } = useSelectedStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CatalogItemEntry>({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    services: "",
    bulk: false,
  });
  const [items, setItems] = useState<CatalogItemEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createCatalog, isPending: isSubmitting } = useMutation({
    ...postCatalogByStoreIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCatalogQueryKey() });
      resetForm();
    },
  });

  function resetForm() {
    setOpen(false);
    setDraft({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      services: "",
      bulk: false,
    });
    setItems([]);
    setError(null);
  }

  function isDraftDirty(): boolean {
    return (
      draft.name !== "" ||
      draft.description !== "" ||
      draft.price !== "" ||
      draft.imageUrl !== "" ||
      draft.services !== "" ||
      draft.bulk !== false
    );
  }

  function isDraftValid(): boolean {
    return (
      draft.imageUrl.trim() !== "" &&
      draft.name.trim() !== "" &&
      draft.description.trim() !== "" &&
      draft.price.trim() !== "" &&
      !isNaN(Number(draft.price)) &&
      Number(draft.price) > 0
    );
  }

  function addToItems() {
    if (!isDraftValid()) return;
    setItems((prev) => [...prev, { ...draft }]);
    setDraft({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      services: "",
      bulk: false,
    });
    setError(null);
  }

  function removeFromItems(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (items.length === 0) {
      setError("Add at least one item to the catalog");
      return;
    }
    if (!selectedStoreId) return;

    await createCatalog({
      path: { storeId: selectedStoreId },
      body: items.map((item) => ({
        name: item.name.trim(),
        description: item.description.trim(),
        price: Number(item.price),
        imageUrl: item.imageUrl || "",
        services: item.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        bulk: item.bulk,
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Catalog
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Catalog Items</DialogTitle>
          <DialogDescription>
            Add products or services to your catalog
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex justify-center">
            <CloudinaryUpload
              value={draft.imageUrl}
              onChange={(url) => setDraft((prev) => ({ ...prev, imageUrl: url }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Item Name</FieldLabel>
              <Input
                value={draft.name}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Wash & Fold"
              />
            </Field>

            <Field>
              <FieldLabel>Price (KES)</FieldLabel>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={draft.price}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="e.g. 500"
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              value={draft.description}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief description of this item"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field className="col-span-2">
              <FieldLabel>Services</FieldLabel>
              <Input
                value={draft.services}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, services: e.target.value }))
                }
                placeholder="e.g. washing, ironing, folding"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate services with commas
              </p>
            </Field>

            <Field>
              <FieldLabel>Billing Type</FieldLabel>
              <div className="flex h-9 items-center">
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, bulk: !prev.bulk }))
                  }
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    draft.bulk
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-input hover:border-primary"
                  }`}
                >
                  {draft.bulk ? "Per Kg" : "Per Item"}
                </button>
              </div>
            </Field>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addToItems}
            disabled={!isDraftValid()}
            className="w-full"
          >
            <PlusIcon className="size-4 mr-2" />
            Add Catalog
          </Button>
        </div>

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
                  <div className="size-14 shrink-0 rounded-md overflow-hidden bg-muted">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-muted-foreground">
                        <span className="text-xs">—</span>
                      </div>
                    )}
                  </div>
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
                      <Badge
                        variant="outline"
                        className={
                          item.bulk
                            ? "bg-indigo-100 text-indigo-700 border-indigo-200 text-xs font-medium"
                            : "bg-amber-100 text-amber-700 border-amber-200 text-xs font-medium"
                        }
                      >
                        {item.bulk ? "Per Kg" : "Per Item"}
                      </Badge>
                      {item.services && (
                        <span className="text-xs text-muted-foreground truncate">
                          {item.services}
                        </span>
                      )}
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

        <Button
          onClick={handleSubmit}
          disabled={items.length === 0 || isSubmitting || isDraftDirty()}
          className="w-full"
        >
          {isSubmitting && <Spinner />}
          Save {items.length} Item{items.length !== 1 ? "s" : ""}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
