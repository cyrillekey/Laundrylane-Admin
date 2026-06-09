"use client";

import { MoreHorizontal, Eye, AlertTriangle, Trash2, Scale } from "lucide-react";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteOrderByIdMutation,
  putOrderByIdWeightMutation,
  getOrderQueryKey,
} from "@/queries/@tanstack/react-query.gen";

interface TableActionsProps {
  id: number;
  isBulk?: boolean;
}

export function OrderTableActions({ id, isBulk }: TableActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const queryClient = useQueryClient();

  const { mutateAsync: deleteOrder, isPending: deleting } = useMutation({
    ...deleteOrderByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getOrderQueryKey() });
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to delete order" });
    },
  });

  const { mutateAsync: updateWeight, isPending: updatingWeight } = useMutation({
    ...putOrderByIdWeightMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getOrderQueryKey() });
      setWeightOpen(false);
      setWeight("");
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to update weight" });
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
          <DropdownMenuItem onClick={() => {}}>
            <Eye className="size-4" />
            View Details
          </DropdownMenuItem>
          {isBulk && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setWeightOpen(true)}>
                <Scale className="size-4" />
                Update Weight
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={weightOpen} onOpenChange={setWeightOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Scale className="text-primary" />
            </AlertDialogMedia>
            <AlertDialogTitle>Update Weight</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the weight for order #{id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Field>
            <FieldLabel>Weight (kg)</FieldLabel>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 2.5"
            />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingWeight} variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!weight || isNaN(Number(weight)) || Number(weight) <= 0 || updatingWeight}
              onClick={() => updateWeight({ path: { id }, body: { weight: Number(weight) } })}
            >
              {updatingWeight ? "Saving..." : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order #{id}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} variant={"outline"}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={() => deleteOrder({ path: { id } })}
            >
              {deleting && <span className="size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
