"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  PackageCheck,
  RefreshCw,
  Scale,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const stepLabels: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  READY_FOR_PICKUP: "Ready for Pickup",
  READY_FOR_DELIVERY: "Ready for Delivery",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
};

const stepDescriptions: Record<string, string> = {
  PENDING: "Order received and awaiting processing.",
  IN_PROGRESS: "Items are being cleaned and processed.",
  READY_FOR_PICKUP: "Order is ready and awaiting customer collection.",
  READY_FOR_DELIVERY: "Order is ready and awaiting dispatch.",
  OUT_FOR_DELIVERY: "Order is on its way to the customer.",
  COMPLETED: "Order has been completed.",
  CANCELLED: "This order was cancelled.",
};

const stepIcons: Record<string, LucideIcon> = {
  PENDING: Clock,
  IN_PROGRESS: RefreshCw,
  READY_FOR_PICKUP: ShoppingBag,
  READY_FOR_DELIVERY: PackageCheck,
  OUT_FOR_DELIVERY: Truck,
  COMPLETED: Check,
  CANCELLED: X,
};

const stepTints: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 ring-amber-200",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  READY_FOR_PICKUP: "bg-blue-100 text-blue-700 ring-blue-200",
  READY_FOR_DELIVERY: "bg-blue-100 text-blue-700 ring-blue-200",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700 ring-purple-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 ring-red-200",
};

type OrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "READY_FOR_PICKUP"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

function buildSteps(orderType?: string, status?: string): OrderStatus[] {
  const readyStep =
    status === "READY_FOR_PICKUP" || status === "READY_FOR_DELIVERY"
      ? status
      : orderType === "PICKUP"
        ? "READY_FOR_PICKUP"
        : "READY_FOR_DELIVERY";
  return ["PENDING", "IN_PROGRESS", readyStep, "OUT_FOR_DELIVERY", "COMPLETED"];
}

interface OrderProgressTrackerProps {
  status: string;
  orderType?: string;
  history?: Array<string | undefined | null>;
  advancing?: boolean;
  onAdvance?: (nextStatus: OrderStatus) => void;
  isBulk?: boolean;
  weighed?: boolean;
  weight?: number | null;
  recordingWeight?: boolean;
  onRecordWeight?: (weight: number) => void | Promise<void>;
}

export function OrderProgressTracker({
  status,
  orderType,
  history = [],
  advancing = false,
  onAdvance,
  isBulk,
  weighed,
  weight,
  recordingWeight = false,
  onRecordWeight,
}: OrderProgressTrackerProps) {
  const [weightOpen, setWeightOpen] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const steps = buildSteps(orderType, status);
  const isCancelled = status === "CANCELLED";
  const isCompleted = status === "COMPLETED";
  const currentIndex = steps.indexOf(status as OrderStatus);

  const reached = new Set(history.filter(Boolean));
  const furthestReached = steps.reduce(
    (max, step, index) => (reached.has(step) ? index : max),
    -1,
  );
  const progressIndex = isCancelled ? furthestReached : currentIndex;
  const progressPercent =
    progressIndex <= 0
      ? 0
      : Math.min(100, (progressIndex / (steps.length - 1)) * 100);

  const nextStep =
    !isCancelled && !isCompleted && currentIndex >= 0
      ? steps[currentIndex + 1]
      : null;

  const requiresWeight =
    isBulk === true &&
    weighed !== true &&
    status === "PENDING" &&
    nextStep === "IN_PROGRESS";

  const weightValue = Number(weightInput);
  const isWeightValid =
    weightInput !== "" && !isNaN(weightValue) && weightValue > 0;

  const handleRecordWeight = async () => {
    if (!isWeightValid || !onRecordWeight) return;
    try {
      await onRecordWeight(weightValue);
      setWeightOpen(false);
      setWeightInput("");
    } catch {
      // Parent mutation surfaces the error via toast; keep dialog open.
    }
  };

  const CurrentIcon = stepIcons[status] ?? Clock;

  return (
    <>
      <Card size="sm">
        <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl ring-2",
              stepTints[status] ?? "bg-muted text-muted-foreground ring-border",
            )}
          >
            <CurrentIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {stepLabels[status] ?? status}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {!isCancelled &&
                !isCompleted &&
                currentIndex >= 0 &&
                `Step ${currentIndex + 1} of ${steps.length} · `}
              {stepDescriptions[status] ?? ""}
            </p>
          </div>
          {nextStep && (
            <Badge variant="outline" className="shrink-0 text-[11px]">
              Next: {stepLabels[nextStep]}
            </Badge>
          )}
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute top-4 right-4 left-4 h-0.5 rounded bg-border"
          >
            <div
              className="h-full rounded bg-primary"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <ol className="relative flex items-start justify-between gap-1">
            {steps.map((step, index) => {
              const done =
                isCompleted ||
                (!isCancelled && index < currentIndex) ||
                (isCancelled && reached.has(step));
              const current =
                !isCancelled && !isCompleted && index === currentIndex;
              const StepIcon = stepIcons[step] ?? Clock;
              return (
                <li
                  key={step}
                  aria-label={stepLabels[step]}
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "flex min-w-0 flex-1",
                    index === 0
                      ? "justify-start"
                      : index === steps.length - 1
                        ? "justify-end"
                        : "justify-center",
                  )}
                >
                  <span
                    title={stepLabels[step]}
                    className={cn(
                      "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-2",
                      (done || current) &&
                        (stepTints[step] ??
                          "bg-muted text-muted-foreground ring-border"),
                      current && "ring-4",
                      !done &&
                        !current &&
                        "bg-muted text-muted-foreground ring-border",
                    )}
                  >
                    <StepIcon className="size-4" />
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Current</span>
            <Badge variant="outline" className="text-[11px] font-medium">
              {stepLabels[status] ?? status}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Next</span>
            {nextStep ? (
              <Badge variant="outline" className="text-[11px] font-medium">
                {stepLabels[nextStep]}
              </Badge>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                {isCancelled ? "—" : "Order complete"}
              </span>
            )}
          </div>
          {requiresWeight ? (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-amber-700">
                {weight != null
                  ? `Recorded: ${weight} kg — re-weigh to start`
                  : "Bulk order · weight required"}
              </span>
              {onRecordWeight ? (
                <Button size="sm" onClick={() => setWeightOpen(true)}>
                  <Scale className="size-3.5" />
                  Record Weight
                </Button>
              ) : (
                <Button size="sm" disabled>
                  <Scale className="size-3.5" />
                  Record Weight
                </Button>
              )}
            </div>
          ) : (
            nextStep &&
            onAdvance && (
              <Button
                size="sm"
                className="ml-auto"
                disabled={advancing}
                onClick={() => onAdvance(nextStep)}
              >
                {advancing ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <ArrowRight className="size-3.5" />
                )}
                Mark as {stepLabels[nextStep]}
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
    <AlertDialog
      open={weightOpen}
      onOpenChange={(open) => {
        setWeightOpen(open);
        if (!open) setWeightInput("");
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Scale className="text-primary" />
          </AlertDialogMedia>
          <AlertDialogTitle>Record Weight</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the weighed weight for this bulk order. This is required
            before moving to In Progress.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel>Weight (kg)</FieldLabel>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="e.g. 2.5"
          />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={recordingWeight} variant="outline">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!isWeightValid || recordingWeight}
            onClick={handleRecordWeight}
          >
            {recordingWeight ? "Saving..." : "Save & Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
