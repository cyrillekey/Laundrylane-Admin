"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  CatalogItemFields,
  type CatalogStagedItem,
} from "@/container/forms/catalog/catalog-item-fields";
import {
  postCatalogByStoreIdMutation,
  getCatalogQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { toast } from "sonner";
import Image from "next/image";

interface CatalogFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CatalogForm({ onBack, onSuccess }: CatalogFormProps) {
  const { selectedStoreId } = useSelectedStore();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CatalogStagedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createCatalog, isPending: isSubmitting } = useMutation({
    ...postCatalogByStoreIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCatalogQueryKey() });
      setItems([]);
      setError(null);
      toast.success("Catalog created successfully!");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to create catalog. Please try again.");
    },
  });

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
    <div className="space-y-6">
      <FieldGroup>
        <div className="rounded-lg border p-4">
          <CatalogItemFields
            onSubmit={(value) => {
              setItems((prev) => [...prev, { ...value }]);
              setError(null);
            }}
          />
        </div>
      </FieldGroup>

      {items.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Staged Items ({items.length})
          </p>
          <div className="h-[5rem] overflow-y-auto space-y-2 pr-1">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className="size-14 shrink-0 rounded-md overflow-hidden bg-muted">
                  {item.imageUrl ? (
                    <Image
                      src={{ src: item.imageUrl, height: 400, width: 400 }}
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={items.length === 0 || isSubmitting}
          className="flex-1"
        >
          {isSubmitting && <Spinner />}
          Save {items.length} Item{items.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
