"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { postOrganisationMembersMutation, getOrganisationMembersInvitesQueryKey } from "@/queries/@tanstack/react-query.gen";
import { UserPlus } from "lucide-react";

const roles = [
  { value: "ORGANISATION_USER", label: "Member" },
  { value: "STORE_MANAGER", label: "Store Manager" },
] as const;

const schema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["ORGANISATION_USER", "STORE_MANAGER"]),
});

export function InviteDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: inviteMember, isPending } = useMutation({
    ...postOrganisationMembersMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getOrganisationMembersInvitesQueryKey() });
      toast.success("Invitation sent!");
      setOpen(false);
    },
    onError(error) {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to send invitation" });
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      role: "ORGANISATION_USER" as "ORGANISATION_USER" | "STORE_MANAGER",
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      await inviteMember({
        body: { email: value.email, role: value.role },
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <UserPlus className="size-4" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organisation
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="email"
                      placeholder="colleague@example.com"
                      aria-invalid={isInvalid}
                      required
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="role">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="role">Role</FieldLabel>
                  <NativeSelect
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as "ORGANISATION_USER" | "STORE_MANAGER")}
                  >
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              )}
            </form.Field>

            <form.Subscribe>
              {({ isSubmitting }) => (
                <Button type="submit" disabled={isSubmitting || isPending} className="w-full">
                  {(isSubmitting || isPending) && <Spinner />}
                  Send Invitation
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
