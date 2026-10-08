"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import {
  postDeliveryDriversMutation,
  getDeliveryDriversQueryKey,
} from "@/queries/@tanstack/react-query.gen";
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
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import z from "zod";

const driverSchema = z.object({
  name: z.string(),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string(),
  vehicleType: z.string(),
  vehicleNumber: z.string(),
  isActive: z.boolean(),
});

export function DriverCreateDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      vehicleType: "",
      vehicleNumber: "",
      isActive: true,
    },
    validators: { onChange: driverSchema },
    onSubmit: async ({ value }) => {
      await createDriver({
        body: {
          name: value.name.trim() || undefined,
          email: value.email.trim(),
          password: value.password,
          phone: value.phone.trim() || null,
          vehicleType: value.vehicleType.trim() || null,
          vehicleNumber: value.vehicleNumber.trim() || null,
          isActive: value.isActive,
        },
      });
    },
  });

  const { mutateAsync: createDriver, isPending: isSubmitting } = useMutation({
    ...postDeliveryDriversMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getDeliveryDriversQueryKey() });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Error!", {
        description: (error as Error)?.message || "Failed to create driver",
      });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </DialogTrigger>
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
            <DialogTitle>Add Driver</DialogTitle>
            <DialogDescription>
              Create a driver account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. Jane Driver"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <Field data-invalid={!!field.state.meta.errors?.length}>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. jane@example.com"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <Field data-invalid={!!field.state.meta.errors?.length}>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="At least 6 characters"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <Field>
                  <FieldLabel>Phone</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. +254712345678"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="vehicleType">
              {(field) => (
                <Field>
                  <FieldLabel>Vehicle Type</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. Motorbike"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="vehicleNumber">
              {(field) => (
                <Field>
                  <FieldLabel>Vehicle Number</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. KDA 123X"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="isActive">
              {(field) => (
                <Field>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Active
                  </label>
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
                Add Driver
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
