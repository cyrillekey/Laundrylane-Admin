"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
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
import AuthenticationService from "@/services/tokenService";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { postOrganisationMembersAcceptInviteMutation } from "@/queries/@tanstack/react-query.gen";

export function AcceptInviteForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { mutateAsync: acceptInvite } = useMutation({
    ...postOrganisationMembersAcceptInviteMutation(),
    onError(error) {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to accept invite" });
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Invalid email"),
        name: z.string().min(1, "Name is required"),
        password: z.string().min(6, "Password min 6 chars"),
        confirmPassword: z.string().min(6, "Confirm Password min 6 chars"),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      }),
    },

    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Invalid invitation link");
        return;
      }

      const response = await acceptInvite({
        body: {
          token,
          email: value.email,
          name: value.name,
          password: value.password,
        },
      });

      if (response.success && response.token && response.user) {
        AuthenticationService.setToken(response.token);
        AuthenticationService.setUser(response.user);
        toast.success("Invitation accepted!");
        router.replace("/onboarding");
      } else {
        toast.error("Error!", {
          description: response.message || "Failed to accept invite",
        });
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
              <div className="flex items-center justify-center rounded-md">
                <Image src={logo} alt="Logo" className="h-14 w-full" />
              </div>
              <span className="sr-only">Laundry Lane</span>
            </a>
            <h1 className="text-xl font-bold">Accept Invitation</h1>
            <FieldDescription>
              You&apos;ve been invited to join an organisation. Set up your account to get started.
            </FieldDescription>
          </div>

          {!token && (
            <p className="text-sm text-destructive text-center">
              Invalid or missing invitation link. Please check your email for the correct link.
            </p>
          )}

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
                    placeholder="m@example.com"
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="text"
                    aria-invalid={isInvalid}
                    placeholder="Your name"
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          <Fragment>
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
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
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
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
                <Button type="submit" disabled={isSubmitting || !token}>
                  {isSubmitting && <Spinner />}
                  Accept Invitation
                </Button>
              )}
            </form.Subscribe>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
