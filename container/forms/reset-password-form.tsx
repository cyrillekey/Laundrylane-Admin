"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import logo from "@/public/logos/logo.png";
import { Fragment } from "react";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import {
  useCheckEmailMutation,
  useLoginMutation,
  useSignupMutation,
  useUpdateUserPasswordMutation,
} from "@/hooks/mutations";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

import { toast } from "sonner";
import AuthenticationService from "@/services/tokenService";
import { useRouter, useSearchParams } from "next/navigation";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync: resetPassword } = useUpdateUserPasswordMutation();
  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: z.object({
        password: z.string().min(6, "Password min 6 chars"),
        confirmPassword: z.string().min(6, "Confirm Password min 6 chars"),
      }),
    },

    onSubmit: async ({ value }) => {
      const response = await resetPassword({
        body: {
          password: value.password,
          confirmPassword: value.confirmPassword,
        },
        token: searchParams.get("token")!,
      });

      if (response.success) {
        if (response.user?.role != "ADMIN") {
          toast.error("Error!", {
            description: "Only admin can login to the admin portal",
          });
          return;
        }

        AuthenticationService.setToken(response.token!);
        AuthenticationService.setUser(response.user!);
        toast.success("Success!", { description: response.message });
        router.push("/app");
      } else {
        router.push("/");
        toast.error("Error!", { description: response.message });
      }
    },
  });
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex  items-center justify-center rounded-md">
                <Image src={logo} alt="Logo" className="h-14 w-full" />
              </div>
              <span className="sr-only">Laundry Lane</span>
            </a>
            <h1 className="text-xl font-bold">Reset your password.</h1>
          </div>
          <Fragment>
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="password"
                      aria-invalid={isInvalid}
                      required
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            </form.Field>
          </Fragment>
          <Fragment>
            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="confirmPassword">
                        Confirm Password
                      </FieldLabel>
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="password"
                      aria-invalid={isInvalid}
                      required
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            </form.Field>
          </Fragment>

          <Field>
            <form.Subscribe>
              {({ isSubmitting }) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Continue
                </Button>
              )}
            </form.Subscribe>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
