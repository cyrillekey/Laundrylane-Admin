"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { PlusIcon, XIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface ServiceTypeInput {
  name: string;
  description: string;
  price: string;
  serviceTimelines: string;
}

export type ServiceTypeFormValues = Array<{
  name: string;
  description?: string;
  price: number;
  serviceTimelines: string;
}>;

interface ServiceTypeFormProps {
  onSubmit: (items: ServiceTypeFormValues) => Promise<void>;
  isSubmitting: boolean;
  onSkip: () => void;
  onBack: () => void;
}

function emptyItem(): ServiceTypeInput {
  return {
    name: "",
    description: "",
    price: "",
    serviceTimelines: "",
  };
}

export function ServiceTypeForm({
  onSubmit,
  isSubmitting,
  onSkip,
}: ServiceTypeFormProps) {
  const [items, setItems] = useState<ServiceTypeInput[]>([
    {
      name: "Standard",
      description: "Standard service turnaround",
      price: "",
      serviceTimelines: "2 days",
    },
    {
      name: "Express",
      description: "Express service turnaround",
      price: "",
      serviceTimelines: "8 hours",
    },
  ]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  function toggleExpand(index: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function updateItem(
    index: number,
    field: keyof ServiceTypeInput,
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(items.length);
      return next;
    });
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function isValid(): boolean {
    return items.every(
      (item) =>
        item.name.trim() &&
        item.price.trim() &&
        !isNaN(Number(item.price)) &&
        Number(item.price) >= 0 &&
        item.serviceTimelines.trim(),
    );
  }

  async function handleSubmit() {
    if (!isValid()) return;

    await onSubmit(
      items.map((item) => ({
        name: item.name.trim(),
        description: item.description.trim() || undefined,
        price: Number(item.price),
        serviceTimelines: item.serviceTimelines.trim(),
      })),
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
          Service types define the speed of your laundry service. For example,
          Standard takes 2 days, Express takes 8 hours, etc.
        </p>

        <div className="space-y-4">
          {items.map((item, index) => {
            const isOpen = expanded.has(index);
            return (
              <div key={index} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(index)}
                    className="flex items-center gap-2 text-sm font-medium flex-1 text-left"
                  >
                    {isOpen ? (
                      <ChevronUpIcon className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDownIcon className="size-4 text-muted-foreground" />
                    )}
                    {item.name || `Service ${index + 1}`}
                    {item.serviceTimelines && (
                      <span className="text-xs text-muted-foreground font-normal ml-1">
                        ({item.serviceTimelines})
                      </span>
                    )}
                  </button>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <XIcon className="size-4" />
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="space-y-4">
                    <Field>
                      <FieldLabel>Service Name</FieldLabel>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        placeholder="e.g. Standard"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Description</FieldLabel>
                      <Textarea
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        placeholder="e.g. Standard service turnaround"
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Price (KES)</FieldLabel>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(index, "price", e.target.value)
                          }
                          placeholder="e.g. 200"
                        />
                      </Field>

                      <Field>
                        <FieldLabel>Timeline</FieldLabel>
                        <Input
                          value={item.serviceTimelines}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "serviceTimelines",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. 2 days"
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="w-full"
        >
          <PlusIcon className="size-4 mr-2" />
          Add Service Type
        </Button>

        <div className="flex gap-4">
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
            disabled={!isValid() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Spinner />}
            Save Service Types
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
