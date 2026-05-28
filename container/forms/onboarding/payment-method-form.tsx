"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import z from "zod";

const paymentOptions = [
  { id: "MPESA_NUMBER", label: "M-Pesa Number" },
  { id: "MPESA_PAYBILL", label: "M-Pesa Paybill" },
  { id: "MPESA_BUY_GOODS", label: "M-Pesa Buy Goods" },
  { id: "AIRTEL_NUMBER", label: "Airtel Number" },
  { id: "BANKACCOUNT", label: "Bank Account" },
] as const;

type PaymentOptionId = (typeof paymentOptions)[number]["id"];

const paymentSchema = z.object({
  name: z.string().min(1, "Payment method name is required"),
  description: z.string().min(1, "Description is required"),
});

export type PaymentMethodFormValues = {
  name: string;
  description: string;
  type: PaymentOptionId;
  configuration: Record<string, string>;
};

interface PaymentMethodFormProps {
  onSubmit: (values: PaymentMethodFormValues) => Promise<void>;
  isSubmitting: boolean;
  onSkip: () => void;
}

const optionConfigFields: Record<
  PaymentOptionId,
  Array<{ name: string; label: string; placeholder: string }>
> = {
  MPESA_NUMBER: [
    {
      name: "phoneNumber",
      label: "Phone Number",
      placeholder: "e.g. +254700123456",
    },
  ],
  MPESA_PAYBILL: [
    {
      name: "businessShortCode",
      label: "Business Short Code",
      placeholder: "e.g. 174379",
    },
    {
      name: "consumerKey",
      label: "Consumer Key",
      placeholder: "Enter consumer key",
    },
    {
      name: "consumerSecret",
      label: "Consumer Secret",
      placeholder: "Enter consumer secret",
    },
    { name: "passkey", label: "Passkey", placeholder: "Enter passkey" },
  ],
  MPESA_BUY_GOODS: [
    {
      name: "tillNumber",
      label: "Till Number",
      placeholder: "e.g. 654321",
    },
  ],
  AIRTEL_NUMBER: [
    {
      name: "phoneNumber",
      label: "Airtel Money Number",
      placeholder: "e.g. +254 700 123 456",
    },
  ],
  BANKACCOUNT: [
    { name: "bankName", label: "Bank Name", placeholder: "e.g. Equity Bank" },
    {
      name: "accountName",
      label: "Account Name",
      placeholder: "e.g. Laundry Lane Ltd",
    },
    {
      name: "accountNumber",
      label: "Account Number",
      placeholder: "e.g. 1234567890",
    },
  ],
};

export function PaymentMethodForm({
  onSubmit,
  isSubmitting,
  onSkip,
}: PaymentMethodFormProps) {
  const [paymentOption, setPaymentOption] =
    useState<PaymentOptionId>("MPESA_NUMBER");
  const [config, setConfig] = useState<Record<string, string>>({});

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onSubmit: paymentSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        type: paymentOption,
        configuration: {
          paymentOption,
          ...config,
        },
      });
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
        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Payment Method Name
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. M-Pesa Payments"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="description">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Brief description of this payment method"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>

        <Field>
          <FieldLabel>Payment Type</FieldLabel>
          <Tabs
            value={paymentOption}
            onValueChange={(v) => {
              setPaymentOption(v as PaymentOptionId);
              setConfig({});
            }}
          >
            <TabsList className="flex-wrap h-auto">
              {paymentOptions.map((opt) => (
                <TabsTrigger key={opt.id} value={opt.id}>
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {paymentOptions.map((opt) => (
              <TabsContent key={opt.id} value={opt.id}>
                <div className="space-y-4 mt-2">
                  {optionConfigFields[opt.id].map((field) => (
                    <Field key={field.name}>
                      <FieldLabel htmlFor={field.name}>
                        {field.label}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={config[field.name] ?? ""}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                      />
                    </Field>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Field>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <form.Subscribe>
            {({ isSubmitting: formSubmitting }) => (
              <Button
                type="submit"
                disabled={formSubmitting || isSubmitting}
                className="flex-1"
              >
                {(formSubmitting || isSubmitting) && <Spinner />}
                Setup Payment Method
              </Button>
            )}
          </form.Subscribe>
        </div>
      </FieldGroup>
    </form>
  );
}
