"use client";

import {
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  Trash2,
  Edit,
  MapPin,
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
  deleteDeliveryZonesByIdMutation,
  getDeliveryZonesQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { ZonePreviewDialog } from "@/container/delivery-zones/zone-preview-dialog";
import { DeliveryZoneEditDialog } from "@/container/forms/delivery-zones/delivery-zones-edit-dialog";

interface TableActionsProps {
  id: number;
  name?: string;
  location?: string;
  price?: number;
  radius?: number;
  latitude?: number;
  longitude?: number;
  startTime?: string | null;
  endTime?: string | null;
}

export function TableActions({
  id,
  name,
  location,
  price,
  radius,
  latitude,
  longitude,
  startTime,
  endTime,
}: TableActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync: deleteZone, isPending: deleting } = useMutation({
    ...deleteDeliveryZonesByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getDeliveryZonesQueryKey() });
    },
    onError: (error) => {
      toast.error("Error!", {
        description:
          (error as Error)?.message || "Failed to delete delivery zone",
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
          <DropdownMenuItem onClick={() => setPreviewOpen(true)}>
            <MapPin className="size-4" />
            Preview Zone
          </DropdownMenuItem>
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

      <DeliveryZoneEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        zone={{ id, name, location, price, radius, latitude, longitude, startTime, endTime }}
      />

      <ZonePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        name={name}
        latitude={latitude}
        longitude={longitude}
        radius={radius}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Delivery Zone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this delivery zone? This action
              cannot be undone.
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
                await deleteZone({ path: { id } });
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
