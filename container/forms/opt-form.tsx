"use client";
import { GalleryVerticalEnd } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Spinner } from "@/components/ui/spinner";

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
  const form = useForm({
    defaultValues: { otp: "" },
    validators: { onSubmit: z.object({ otp: z.string().min(6) }) },
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
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Enter verification code</h1>
            <FieldDescription>
              We sent a 6-digit code to your email address
            </FieldDescription>
          </div>
          <form.Field name="otp">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field aria-invalid={isInvalid}>
                  <FieldLabel htmlFor="otp" className="sr-only">
                    Verification code
                  </FieldLabel>
                  <InputOTP
                    maxLength={6}
                    name={field.name}
                    aria-invalid={isInvalid}
                    id={field.name}
                    onChange={field.handleChange}
                    required
                    containerClassName="gap-4"
                  >
                    <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                      <InputOTPSlot index={0} aria-invalid={isInvalid} />
                      <InputOTPSlot index={1} aria-invalid={isInvalid} />
                      <InputOTPSlot index={2} aria-invalid={isInvalid} />
                    </InputOTPGroup>
                    <InputOTPSeparator aria-invalid={isInvalid} />
                    <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                      <InputOTPSlot index={3} aria-invalid={isInvalid} />
                      <InputOTPSlot index={4} aria-invalid={isInvalid} />
                      <InputOTPSlot index={5} aria-invalid={isInvalid} />
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldError errors={field.state.meta.errors} />
                  <FieldDescription className="text-center">
                    Didn&apos;t receive the code? <a href="#">Resend</a>
                  </FieldDescription>
                </Field>
              );
            }}
          </form.Field>
          <form.Subscribe>
            {({ isSubmitting }) => (
              <Field>
                <Button type="submit">
                  {isSubmitting && <Spinner />}
                  Verify
                </Button>
              </Field>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
