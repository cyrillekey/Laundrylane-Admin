"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  putOrganisationByIdMutation,
  getOrganisationUserOptions,
  getOrganisationUserQueryKey,
} from "@/queries/@tanstack/react-query.gen";

const schema = z.object({
  name: z.string().min(1, "Organisation name is required"),
  address: z.string(),
  tel: z.string(),
  email: z.email("Invalid email"),
  website: z.url().default("").optional(),
});

export function OrganisationForm() {
  const queryClient = useQueryClient();

  const { data: organisation, isPending: orgPending } = useQuery({
    ...getOrganisationUserOptions(),
  });

  const { mutateAsync: updateOrganisation, isPending } = useMutation({
    ...putOrganisationByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getOrganisationUserQueryKey(),
      });
      toast.success("Organisation updated successfully");
    },
    onError(error) {
      toast.error("Error!", {
        description:
          (error as Error)?.message || "Failed to update organisation",
      });
    },
  });

  const form = useForm({
    defaultValues: {
      name: organisation?.name ?? "",
      address: organisation?.address ?? "",
      tel: organisation?.tel ?? "",
      email: organisation?.email ?? "",
      website: organisation?.website ?? "",
    },
    validators: {
      // @ts-expect-error this is fine
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      if (!organisation?.id) return;
      await updateOrganisation({
        path: { id: organisation.id },
        body: {
          name: value.name,
          address: value.address || undefined,
          tel: value.tel || undefined,
          email: value.email || undefined,
          website: value.website || undefined,
        },
      });
    },
  });

  if (orgPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="name">Organisation Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
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
                    aria-invalid={isInvalid}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="address">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="tel">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="tel">Phone</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="tel"
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="website">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {({ isSubmitting }) => (
            <Button type="submit" disabled={isSubmitting || isPending}>
              {(isSubmitting || isPending) && <Spinner />}
              Save Changes
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
