"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getOrganisationUserOptions } from "@/queries/@tanstack/react-query.gen";
import z from "zod";

const organisationSchema = z.object({
  organisationName: z.string().min(1, "Organisation name is required"),
  organisationAddress: z.string().min(1, "Organisation address is required"),
  organisationTel: z.string().min(1, "Phone number is required"),
  organisationEmail: z.string().email("Invalid email address"),
  organisationWebsite: z.string().optional(),
});

export type OrganisationFormValues = z.infer<typeof organisationSchema>;

interface OrganisationFormProps {
  onSubmit: (values: OrganisationFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function OrganisationForm({
  onSubmit,
  isSubmitting = false,
}: OrganisationFormProps) {
  const { data: org } = useQuery({
    ...getOrganisationUserOptions(),
  });

  const form = useForm({
    defaultValues: {
      organisationName: org?.name ?? "",
      organisationAddress: org?.address ?? "",
      organisationTel: org?.tel ?? "",
      organisationEmail: org?.email ?? "",
      organisationWebsite: org?.website ?? "",
    },
    validators: {
      //@ts-expect-error error with zod type
      onSubmit: organisationSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="organisationName">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Organisation Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Laundry Lane Ltd"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="organisationAddress">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Organisation Address
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. 123 Main Street"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="organisationEmail">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Organisation Email
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="email"
                  placeholder="e.g. hello@laundrylane.com"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="organisationTel">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Organisation Phone
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="tel"
                  placeholder="e.g. +254 712 345 678"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="organisationWebsite">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Organisation Website
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. https://laundrylane.com"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>

        <form.Subscribe>
          {({ isSubmitting: formSubmitting }) => (
            <Button
              type="submit"
              disabled={formSubmitting || isSubmitting}
              className="w-full"
            >
              {(formSubmitting || isSubmitting) && <Spinner />}
              Continue
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
