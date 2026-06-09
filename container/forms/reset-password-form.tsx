"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import logo from "@/public/logos/logo.png";
import { Fragment, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import z from "zod";
import { Spinner } from "@/components/ui/spinner";

import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { postAuthenticationResetpasswordConfirmMutation } from "@/queries/@tanstack/react-query.gen";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync: resetPassword } = useMutation({
    ...postAuthenticationResetpasswordConfirmMutation(),
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to reset password" });
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
          token: searchParams.get("token")!,
        },
      });

      if (response.success) {
        toast.success("Success!", { description: response.message });
        router.push("/login");
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
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        aria-invalid={isInvalid}
                        required
                        className="pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </button>
                    </div>
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
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type={showConfirm ? "text" : "password"}
                        aria-invalid={isInvalid}
                        required
                        className="pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((p) => !p)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <EyeOffIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </button>
                    </div>
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
