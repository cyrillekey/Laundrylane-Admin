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

import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

import { toast } from "sonner";
import AuthenticationService from "@/services/tokenService";
import { useRouter } from "next/navigation";
import GoogleAuthButton from "@/components/shared/GoogleAuth";
import { useMutation } from "@tanstack/react-query";
import {
  postAuthenticationEmailMutation,
  postAuthenticationLoginMutation,
  postAuthenticationSignupMutation,
} from "@/queries/@tanstack/react-query.gen";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { mutateAsync: checkEmail } = useMutation({
    ...postAuthenticationEmailMutation(),
  });
  const { mutateAsync: signUp } = useMutation({
    ...postAuthenticationSignupMutation(),
  });
  const { mutateAsync: login } = useMutation({
    ...postAuthenticationLoginMutation(),
  });
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      type: "initial",
    },
    validators: {
      //@ts-expect-error error with zod type union
      onSubmit: schema,
    },

    onSubmit: async ({ value, formApi }) => {
      console.log(value);
      if (value.type === "initial") {
        const res = await checkEmail({ body: { email: value.email } });

        if (res.registered) {
          formApi.setFieldValue("type", () => "login");
        } else {
          formApi.setFieldValue("type", "register");
        }
      } else {
        if (value.type === "register") {
          const res = await signUp({
            body: {
              email: value.email,
              password: value.password,
              name: value.name,
              role: "ORGANISATION_ADMIN",
            },
          });
          if (res.success && res.token) {
            AuthenticationService.setToken(res.token!);
            AuthenticationService.setUser(res.user!);
            router.push("/email-verify");
          } else {
            toast.error("Error!", { description: res.message });
          }
        } else {
          const res = await login({
            body: {
              value: value.email,
              password: value.password,
            },
          });
          if (res.success && res.token && res.user) {
            if (
              res.user.role == "ORGANISATION_ADMIN" ||
              res.user.role == "ORGANISATION_USER"
            ) {
              AuthenticationService.setToken(res.token!);
              AuthenticationService.setUser(res.user!);
              router.push("/app");
            } else {
              toast.error("Error!", {
                description: "Only admin can login to the admin portal",
              });
            }
          } else {
            toast.error("Error!", { description: res.message });
          }
        }
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
            <h1 className="text-xl font-bold">Welcome to Laundry Lane.</h1>
            <FieldDescription>
              We&apos;re excited to have you join our community!
            </FieldDescription>
          </div>
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id={field.name}
                    disabled={form.getFieldValue("type") !== "initial"}
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

          <Fragment>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    data-invalid={isInvalid}
                    hidden={form.getFieldValue("type") !== "register"}
                  >
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      aria-invalid={isInvalid}
                      required
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    data-invalid={isInvalid}
                    hidden={form.getFieldValue("type") == "initial"}
                  >
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link
                        hidden={
                          form.getFieldValue("type") == "initial" ||
                          form.getFieldValue("type") == "register"
                        }
                        href="forgot-password"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
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
          {form.getFieldValue("type") == "initial" && (
            <Link
              href="forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline -mt-2"
            >
              Forgot your password?
            </Link>
          )}
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

          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button>
            <GoogleAuthButton />
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link href="/terms-of-service">Terms of Service</Link> and{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("initial"),
    email: z.string().email(),
    password: z.string().optional(),
    name: z.string().optional(),
  }),
  z.object({
    type: z.literal("login"),
    email: z.string().email(),
    password: z.string().min(6, "Password is required for login"),
    name: z.string().optional(),
  }),
  z.object({
    type: z.literal("register"),
    email: z.string().email(),
    password: z.string().min(6, "Password min 6 chars"),
    name: z.string().min(1, "Name is required for registration"),
  }),
]);
