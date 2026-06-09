"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  ClothTypeItemFields,
  type ClothTypeStagedItem,
} from "@/container/forms/cloth-types/cloth-type-item-fields";
import {
  postCatalogClothesByStoreIdMutation,
  getCatalogClothesQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { toast } from "sonner";

interface ClothTypeFormProps {
  onSkip: () => void;
  onBack: () => void;
  onSuccess: () => void;
}

export function ClothTypeForm({
  onSkip,
  onBack,
  onSuccess,
}: ClothTypeFormProps) {
  const { selectedStoreId } = useSelectedStore();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<ClothTypeStagedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createClothTypes, isPending: isSubmitting } = useMutation(
    {
      ...postCatalogClothesByStoreIdMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getCatalogClothesQueryKey(),
        });
        setItems([]);
        setError(null);
        toast.success("Cloth types created successfully!");
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to create cloth types. Please try again.");
      },
    },
  );

  function removeFromItems(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (items.length === 0) {
      setError("Add at least one cloth type");
      return;
    }
    if (!selectedStoreId) return;

    await createClothTypes({
      path: { storeId: selectedStoreId },
      body: items.map((item) => ({
        name: item.name.trim(),
        type: item.type,
        price: Number(item.price),
      })),
    });
  }

  return (
    <div className="space-y-6">
      <FieldGroup>
        <div className="rounded-lg border p-4">
          <ClothTypeItemFields
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
          <div className="h-[9rem] overflow-y-auto space-y-2 pr-1">
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">
                      KES {Number(item.price).toLocaleString()}
                    </span>
                    {item.type && (
                      <span className="text-xs text-muted-foreground">
                        {item.type}
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
          variant="outline"
          onClick={onSkip}
          disabled={isSubmitting}
        >
          Skip
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
