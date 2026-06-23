"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload";
import {
  putUserMutation,
  getUserQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import AuthenticationService from "@/services/tokenService";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  userName: z.string().optional(),
  avatar: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export function AccountForm() {
  const queryClient = useQueryClient();
  const user = AuthenticationService.getUser();

  const { mutateAsync: updateUser, isPending } = useMutation({
    ...putUserMutation(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: getUserQueryKey() });
      if (response.user) {
        AuthenticationService.setUser(response.user);
      }
      toast.success("Account updated successfully");
    },
    onError(error) {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to update account" });
    },
  });

  const form = useForm({
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      userName: user?.userName ?? "",
      avatar: user?.avatar ?? "",
      gender: user?.gender ?? "",
      dateOfBirth: user?.dateOfBirth ?? "",
    },
    validators: {
      // @ts-expect-error ignore schema error
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      await updateUser({
        body: {
          name: value.name,
          email: value.email,
          phone: value.phone || undefined,
          username: value.userName || undefined,
          avatar: value.avatar || undefined,
          gender: value.gender || undefined,
          dateOfBirth: value.dateOfBirth || undefined,
        },
      });
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="avatar">
          {(field) => (
            <Field>
              <FieldLabel>Avatar</FieldLabel>
              <div className="flex justify-center">
                <CloudinaryUpload
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              </div>
            </Field>
          )}
        </form.Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field name="name">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
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
                    aria-invalid={isInvalid}
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="phone">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
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

          <form.Field name="userName">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="userName">Username</FieldLabel>
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

          <form.Field name="gender">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="gender">Gender</FieldLabel>
                <NativeSelect
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </NativeSelect>
              </Field>
            )}
          </form.Field>

          <form.Field name="dateOfBirth">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="date"
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
