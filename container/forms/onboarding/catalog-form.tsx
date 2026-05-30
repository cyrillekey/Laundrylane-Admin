"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload";
import { PlusIcon, XIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface CatalogItemInput {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  services: string;
  bulk: boolean;
}

export type CatalogFormValues = Array<{
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  services: string[];
  bulk: boolean;
}>;

interface CatalogFormProps {
  onSubmit: (items: CatalogFormValues) => Promise<void>;
  isSubmitting: boolean;
  onBack: () => void;
}

function emptyItem(): CatalogItemInput {
  return {
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    services: "",
    bulk: false,
  };
}

export function CatalogForm({
  onSubmit,
  isSubmitting,
}: CatalogFormProps) {
  const [items, setItems] = useState<CatalogItemInput[]>([emptyItem()]);
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
    field: keyof CatalogItemInput,
    value: string | boolean,
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
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }

  function isValid(): boolean {
    return items.every(
      (item) =>
        item.name.trim() &&
        item.description.trim() &&
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
        description: item.description.trim(),
        price: Number(item.price),
        imageUrl: item.imageUrl || "",
        services: item.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        bulk: item.bulk,
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
        
        <div className="space-y-4 " >
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
                    {item.name || `Item ${index + 1}`}
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
                    <div className="flex justify-center">
                      <CloudinaryUpload
                        value={item.imageUrl}
                        onChange={(url) => updateItem(index, "imageUrl", url)}
                      />
                    </div>

                    <Field>
                      <FieldLabel>Item Name</FieldLabel>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        placeholder="e.g. Wash & Fold"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Description</FieldLabel>
                      <Textarea
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        placeholder="Brief description of this item"
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
                          placeholder="e.g. 500"
                        />
                      </Field>

                      <Field>
                        <FieldLabel>Billing</FieldLabel>
                        <div className="flex h-9 items-center">
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(index, "bulk", !item.bulk)
                            }
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                              item.bulk
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-input hover:border-primary"
                            }`}
                          >
                            {item.bulk ? "Per Kg" : "Per Item"}
                          </button>
                        </div>
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel>Services</FieldLabel>
                      <Input
                        value={item.services}
                        onChange={(e) =>
                          updateItem(index, "services", e.target.value)
                        }
                        placeholder="e.g. washing, ironing, folding"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separate services with commas
                      </p>
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
          Add Item
        </Button>

        <Button
          type="submit"
          disabled={!isValid() || isSubmitting}
          className="w-full"
        >
          {isSubmitting && <Spinner />}
          Save Catalog
        </Button>
      </FieldGroup>
    </form>
  );
}
