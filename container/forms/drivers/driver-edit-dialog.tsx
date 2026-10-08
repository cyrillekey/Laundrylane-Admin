"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  putDeliveryDriversByIdMutation,
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
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import z from "zod";

const driverSchema = z.object({
  vehicleType: z.string(),
  vehicleNumber: z.string(),
  isActive: z.boolean(),
});

interface DriverEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: {
    id: number;
    isActive?: boolean;
    vehicleType?: string | null;
    vehicleNumber?: string | null;
    deliveryType?: "PICKUP" | "DROPOFF" | "PICKUP_AND_DROPOFF";
  };
}

export function DriverEditDialog({
  open,
  onOpenChange,
  driver,
}: DriverEditDialogProps) {
  const queryClient = useQueryClient();

  const { mutateAsync: updateDriver, isPending: isSubmitting } = useMutation({
    ...putDeliveryDriversByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getDeliveryDriversQueryKey() });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error!", {
        description: (error as Error)?.message || "Failed to update driver",
      });
    },
  });

  const form = useForm({
    defaultValues: {
      vehicleType: driver.vehicleType ?? "",
      vehicleNumber: driver.vehicleNumber ?? "",
      isActive: driver.isActive ?? true,
    },
    validators: { onChange: driverSchema },
    onSubmit: async ({ value }) => {
      await updateDriver({
        path: { id: driver.id },
        body: {
          vehicleType: value.vehicleType.trim() || null,
          vehicleNumber: value.vehicleNumber.trim() || null,
          isActive: value.isActive,
        },
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
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>Update driver details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <form.Field name="vehicleType">
              {(field) => (
                <Field>
                  <FieldLabel>Vehicle Type</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
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
                Update Driver
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
