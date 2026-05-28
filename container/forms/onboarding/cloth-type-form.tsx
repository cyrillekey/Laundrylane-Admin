"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, XIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

const CLOTH_TYPES = [
  "Shirt",
  "T-Shirt",
  "Casual",
  "Dress",
  "Suits",
  "Trouser",
  "Jeans",
  "Jacket",
  "Coat",
  "Hoodie",
  "Sweater",
  "Shorts",
  "Skirt",
  "Blouse",
  "Traditional",
  "Uniform",
  "Other",
];

interface ClothTypeInput {
  name: string;
  type: string;
  price: string;
}

export type ClothTypeFormValues = Array<{
  name: string;
  type: string;
  price: number;
}>;

interface ClothTypeFormProps {
  onSubmit: (items: ClothTypeFormValues) => Promise<void>;
  isSubmitting: boolean;
  onSkip: () => void;
  onBack: () => void;
}

function emptyItem(): ClothTypeInput {
  return {
    name: "",
    type: "",
    price: "",
  };
}

export function ClothTypeForm({
  onSubmit,
  isSubmitting,
  onSkip,
  onBack,
}: ClothTypeFormProps) {
  const [items, setItems] = useState<ClothTypeInput[]>([emptyItem()]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const [openSelect, setOpenSelect] = useState<number | null>(null);

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
    field: keyof ClothTypeInput,
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
        item.type &&
        item.price.trim() &&
        !isNaN(Number(item.price)) &&
        Number(item.price) > 0,
    );
  }

  async function handleSubmit() {
    if (!isValid()) return;

    await onSubmit(
      items.map((item) => ({
        name: item.name.trim(),
        type: item.type,
        price: Number(item.price),
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
                    {item.name || `Cloth ${index + 1}`}
                    {item.type && (
                      <span className="text-xs text-muted-foreground font-normal ml-1">
                        ({item.type})
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
                      <FieldLabel>Cloth Name</FieldLabel>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        placeholder="e.g. Cotton Shirt"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Type</FieldLabel>
                      <Select
                        value={item.type}
                        onValueChange={(v) => {
                          if (v) updateItem(index, "type", v);
                          setOpenSelect(null);
                        }}
                        open={openSelect === index}
                        onOpenChange={(open) => {
                          setOpenSelect(open ? index : null);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select cloth type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLOTH_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

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
                        placeholder="e.g. 300"
                      />
                    </Field>
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
          Add Cloth Type
        </Button>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
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
            disabled={!isValid() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Spinner />}
            Save Cloth Types
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
