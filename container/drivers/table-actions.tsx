"use client";

import {
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteDeliveryDriversByIdMutation,
  getDeliveryDriversQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { DriverEditDialog } from "@/container/forms/drivers/driver-edit-dialog";

interface DriverTableActionsProps {
  id: number;
  isActive?: boolean;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  deliveryType?: "PICKUP" | "DROPOFF" | "PICKUP_AND_DROPOFF";
}

export function DriverTableActions({
  id,
  isActive,
  vehicleType,
  vehicleNumber,
  deliveryType,
}: DriverTableActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync: deleteDriver, isPending: deleting } = useMutation({
    ...deleteDeliveryDriversByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getDeliveryDriversQueryKey() });
    },
    onError: (error) => {
      toast.error("Error!", {
        description: (error as Error)?.message || "Failed to delete driver",
      });
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DriverEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        driver={{ id, isActive, vehicleType, vehicleNumber, deliveryType }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this driver? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} variant={"outline"}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={async () => {
                await deleteDriver({ path: { id } });
              }}
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
