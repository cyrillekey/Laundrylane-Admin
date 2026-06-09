"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { getPaymentsMethodOptions } from "@/queries/@tanstack/react-query.gen";
import { CheckIcon } from "lucide-react";

interface StorePaymentMethodsFormProps {
  onSubmit: (paymentMethodIds: number[]) => Promise<void>;
  isSubmitting: boolean;
  onSkip: () => void;
  onBack: () => void;
}

export function StorePaymentMethodsForm({
  onSubmit,
  isSubmitting,
  onSkip,
  onBack,
}: StorePaymentMethodsFormProps) {
  const { data: methods, isLoading } = useQuery({
    ...getPaymentsMethodOptions(),
  });

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  function toggleMethod(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (selectedIds.size === 0) {
      onSkip();
      return;
    }
    await onSubmit(Array.from(selectedIds));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!methods || methods.length === 0) {
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSkip();
        }}
      >
        <FieldGroup>
          <p className="text-sm text-muted-foreground mb-2">
            No payment methods available. You can set this up later.
          </p>
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }}
    >
      <FieldGroup>
        <p className="text-sm text-muted-foreground mb-2">
          Select which payment methods your store will accept. You can change
          these later.
        </p>

        <div className="space-y-3">
          {methods.map((method) => {
            const isSelected = method.id != null && selectedIds.has(method.id);
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => method.id != null && toggleMethod(method.id)}
                className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-all hover:bg-accent ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-input"
                }`}
              >
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}
                >
                  {isSelected && <CheckIcon className="size-3" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{method.name}</span>
                  {method.description && (
                    <span className="text-xs text-muted-foreground">
                      {method.description}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          {selectedIds.size === 0
            ? "No payment methods selected"
            : `${selectedIds.size} payment method${selectedIds.size > 1 ? "s" : ""} selected`}
        </p>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Spinner />}
            Continue
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
