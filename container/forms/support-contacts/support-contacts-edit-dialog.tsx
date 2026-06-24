"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  putSupportContactsByIdMutation,
  getSupportContactsQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import z from "zod";

const supportContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  type: z.string().min(1, "Type is required"),
});

const contactTypes = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "social", label: "Social Media" },
  { value: "website", label: "Website" },
];

interface SupportContact {
  id: number;
  name?: string;
  value?: string;
  type?: string;
}

interface SupportContactEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: SupportContact;
}

export function SupportContactEditDialog({
  open,
  onOpenChange,
  contact,
}: SupportContactEditDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: contact.name ?? "",
      value: contact.value ?? "",
      type: contact.type ?? "",
    },
    validators: { onChange: supportContactSchema },
    onSubmit: async ({ value }) => {
      await updateContact({
        path: { id: contact.id },
        body: {
          name: value.name.trim(),
          value: value.value.trim(),
          type: value.type,
        },
      });
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const { mutateAsync: updateContact, isPending: isSubmitting } = useMutation({
    ...putSupportContactsByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getSupportContactsQueryKey() });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error!", {
        description:
          (error as Error)?.message || "Failed to update contact",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Support Contact</DialogTitle>
            <DialogDescription>
              Update the contact details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <form.Field name="type">
              {(field) => (
                <Field data-invalid={!!field.state.meta.errors?.length}>
                  <FieldLabel>Type</FieldLabel>
                  <NativeSelect
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  >
                    <NativeSelectOption value="" disabled>
                      Select type...
                    </NativeSelectOption>
                    {contactTypes.map((t) => (
                      <NativeSelectOption key={t.value} value={t.value}>
                        {t.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="name">
              {(field) => (
                <Field data-invalid={!!field.state.meta.errors?.length}>
                  <FieldLabel>Label</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. Customer Support, Sales, WhatsApp"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="value">
              {(field) => (
                <Field data-invalid={!!field.state.meta.errors?.length}>
                  <FieldLabel>Value</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. +254700000000, support@example.com"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </div>

          <form.Subscribe>
            {({ isSubmitting: formSubmitting }) => (
              <Button
                type="submit"
                disabled={formSubmitting || isSubmitting}
                className="w-full"
              >
                {(formSubmitting || isSubmitting) && <Spinner />}
                Save Changes
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
