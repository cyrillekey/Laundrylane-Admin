"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  postAuthenticationSignupResendOtpMutation,
  postAuthenticationSignupVerifyOtpMutation,
} from "@/queries/@tanstack/react-query.gen";
import AuthenticationService from "@/services/tokenService";
import Image from "next/image";
import logo from "@/public/logos/logo.png";
import { MailCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function EmailVerifyForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const user = AuthenticationService.getUser();

  const { mutateAsync: verifyOtp, isPending: isVerifying } = useMutation({
    ...postAuthenticationSignupVerifyOtpMutation(),
  });

  const { mutateAsync: resendOtp, isPending: isResending } = useMutation({
    ...postAuthenticationSignupResendOtpMutation(),
    onError: (err) => {
      const retryAfter = (err as { retryAfter?: number })?.retryAfter;
      if (retryAfter) {
        setCountdown(retryAfter);
      }
    },
  });

  const [countdown, setCountdown] = useState(60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [countdown, clearTimer]);

  const handleResend = async () => {
    if (!user?.email || countdown > 0 || isResending) return;
    const res = await resendOtp({ body: { email: user.email } });
    if (res.success) {
      setCountdown(60);
      toast.success("Code resent!", {
        description: "Check your inbox for a new verification code.",
      });
    } else {
      toast.error("Failed to resend", {
        description: res.message ?? "Please try again later.",
      });
    }
  };

  const form = useForm({
    defaultValues: { otp: "" },
    onSubmit: async ({ value }) => {
      if (!user?.email) {
        toast.error("Session expired", {
          description: "Please sign up again.",
        });
        router.push("/signup");
        return;
      }
      const res = await verifyOtp({
        body: {
          otp: value.otp,
          email: user.email,
        },
      });
      if (res.success && res.token && res.user) {
        AuthenticationService.setToken(res.token);
        AuthenticationService.setUser(res.user);
        toast.success("Email verified successfully!");
        window.location.replace("/onboarding");
      } else {
        toast.error("Verification failed", {
          description: res.message ?? "Invalid code. Please try again.",
        });
      }
    },
    validators: {
      onSubmit: z.object({
        otp: z.string().min(6, "Enter the full 6-digit code"),
      }),
    },
  });

  if (!user?.email) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4 text-center",
          className,
        )}
        {...props}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10">
          <MailCheck className="size-6 text-destructive" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Session expired</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your session has expired. Please sign up again to continue.
        </p>
        <Button onClick={() => router.push("/signup")} className="mt-2">
          Back to sign up
        </Button>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold">Verify your email</h1>
            <FieldDescription>
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">
                {user.email}
              </span>
            </FieldDescription>
          </div>

          <form.Field name="otp">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field aria-invalid={isInvalid}>
                  <InputOTP
                    maxLength={6}
                    name={field.name}
                    aria-invalid={isInvalid}
                    id={field.name}
                    onChange={field.handleChange}
                    required
                    containerClassName="gap-4"
                  >
                    <InputOTPGroup className="gap-1.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-9 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                      <InputOTPSlot index={0} aria-invalid={isInvalid} />
                      <InputOTPSlot index={1} aria-invalid={isInvalid} />
                      <InputOTPSlot index={2} aria-invalid={isInvalid} />
                    </InputOTPGroup>
                    <InputOTPSeparator aria-invalid={isInvalid} />
                    <InputOTPGroup className="gap-1.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-9 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                      <InputOTPSlot index={3} aria-invalid={isInvalid} />
                      <InputOTPSlot index={4} aria-invalid={isInvalid} />
                      <InputOTPSlot index={5} aria-invalid={isInvalid} />
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldError errors={field.state.meta.errors} />
                  <FieldDescription className="text-center flex flex-row justify-center gap-1 items-center">
                    {countdown > 0 ? (
                      <span className="tabular-nums">
                        Resend available in{" "}
                        <span className="font-medium text-foreground">
                          {Math.floor(countdown / 60)}:
                          {String(countdown % 60).padStart(2, "0")}
                        </span>
                      </span>
                    ) : (
                      <>
                        Didn&apos;t receive the code?{" "}
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={isResending}
                          className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isResending ? <Spinner /> : "Resend"}
                        </button>
                      </>
                    )}
                  </FieldDescription>
                </Field>
              );
            }}
          </form.Field>

          <form.Subscribe>
            {({ isSubmitting }) => (
              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting || isVerifying}
                >
                  {(isSubmitting || isVerifying) && <Spinner />}
                  Verify email
                </Button>
              </Field>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
