"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  StoreForm,
  type StoreFormValues,
} from "@/container/forms/onboarding/store-form";
import {
  postStoreMutation,
  getStoreQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";

interface CreateStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStoreDialog({ open, onOpenChange }: CreateStoreDialogProps) {
  const queryClient = useQueryClient();
  const { setSelectedStoreId } = useSelectedStore();

  const { mutateAsync: createStore, isPending: creatingStore } = useMutation({
    ...postStoreMutation(),
  });

  const handleCreateStore = async (store: StoreFormValues) => {
    try {
      const storeResponse = await createStore({
        body: {
          name: store.name,
          location: store.location,
          latitude: Number(store.latitude),
          longitude: Number(store.longitude),
          opening: store.opening,
          closing: store.closing,
          logo: store.logo || undefined,
          coverImage: store.coverImage || undefined,
          radius: store.radius ? Number(store.radius) : undefined,
          daysOff:
            store.daysOff && store.daysOff.length > 0
              ? store.daysOff
              : undefined,
        },
      });
      if (storeResponse.id) {
        setSelectedStoreId(storeResponse.id);
        queryClient.invalidateQueries({ queryKey: getStoreQueryKey() });
        onOpenChange(false);
      }
      toast.success("Store created successfully!");
    } catch {
      toast.error("Failed to create store. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Store</DialogTitle>
          <DialogDescription>
            Set up a new store for your organisation
          </DialogDescription>
        </DialogHeader>
        <StoreForm
          onBack={() => onOpenChange(false)}
          onSubmit={handleCreateStore}
          isCreating={creatingStore}
        />
      </DialogContent>
    </Dialog>
  );
}
