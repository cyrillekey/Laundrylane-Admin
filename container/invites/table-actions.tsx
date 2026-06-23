"use client";

import {
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  Trash2,
  RefreshCw,
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
  AlertDialogAction,
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
  deleteOrganisationMembersInvitesByInviteIdMutation,
  postOrganisationMembersInvitesByInviteIdResendMutation,
  getOrganisationMembersInvitesQueryKey,
} from "@/queries/@tanstack/react-query.gen";

interface InviteTableActionsProps {
  id: number;
  status?: string;
}

export function InviteTableActions({ id, status }: InviteTableActionsProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: cancelInvite, isPending: cancelling } = useMutation({
    ...deleteOrganisationMembersInvitesByInviteIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getOrganisationMembersInvitesQueryKey() });
      toast.success("Invitation cancelled");
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to cancel invitation" });
    },
  });

  const { mutateAsync: resendInvite, isPending: resending } = useMutation({
    ...postOrganisationMembersInvitesByInviteIdResendMutation(),
    onSuccess: () => {
      toast.success("Invitation resent");
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to resend invitation" });
    },
  });

  const isPendingInvite = status?.toLowerCase() === "pending";
  const isDisabled = resending || cancelling;

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
          <DropdownMenuItem
            disabled={!isPendingInvite || isDisabled}
            onClick={() => resendInvite({ path: { inviteId: id } })}
          >
            {resending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Resend
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!isPendingInvite || isDisabled}
            onClick={() => setOpen(true)}
          >
            <Trash2 className="size-4" />
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation? The invitee will no longer be able to join your organisation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling} variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelling}
              onClick={() => cancelInvite({ path: { inviteId: id } })}
            >
              {cancelling && <Loader2 className="size-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
