"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, XIcon } from "lucide-react";
import { postCatalogServiceTypesByStoreIdMutation, getCatalogServiceTypesQueryKey } from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  ServiceTypeItemFields,
  type ServiceTypeStagedItem,
} from "./service-type-item-fields";

export function ServiceTypesCreateDialog() {
  const { selectedStoreId } = useSelectedStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ServiceTypeStagedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createServiceType, isPending: isSubmitting } = useMutation({
    ...postCatalogServiceTypesByStoreIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCatalogServiceTypesQueryKey() });
      resetForm();
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to create service types" });
    },
  });

  function resetForm() {
    setOpen(false);
    setItems([]);
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

        <div className="rounded-lg border p-4">
          <ServiceTypeItemFields
            onSubmit={(value) => {
              setItems((prev) => [...prev, { ...value }]);
              setError(null);
            }}
          />
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

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={items.length === 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting && <Spinner />}
          Save {items.length} Item{items.length !== 1 ? "s" : ""}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
