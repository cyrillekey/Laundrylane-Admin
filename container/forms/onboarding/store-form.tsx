"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Spinner } from "@/components/ui/spinner";
import { MapPinIcon, Loader2Icon, XIcon, ImageIcon } from "lucide-react";
import Image from "next/image";
import { getAddressAutocompleteOptions } from "@/queries/@tanstack/react-query.gen";
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload";
import z from "zod";

const CATEGORIES = [
  {
    title: "Self-Service Laundromat",
    description:
      "Customers use self-service washing and drying machines and pay per load.",
    services: [
      "Self-Service Washing",
      "Self-Service Drying",
      "Coin/Card Payment",
    ],
  },
  {
    title: "Wash and Fold",
    description:
      "Customers drop off laundry and staff wash, dry, fold, and package it for pickup.",
    services: ["Washing", "Drying", "Folding"],
  },
  {
    title: "Dry Cleaning",
    description:
      "Specialized cleaning service for delicate garments and fabrics that require solvent-based cleaning.",
    services: ["Garment Dry Cleaning", "Stain Removal", "Fabric Care"],
  },
  {
    title: "Pickup and Delivery Laundry",
    description:
      "Laundry is collected from customers, professionally cleaned, and delivered back to their location.",
    services: ["Laundry Pickup", "Laundry Cleaning", "Home Delivery"],
  },
  {
    title: "Commercial Laundry",
    description:
      "Large-scale laundry services for businesses such as hotels, hospitals, restaurants, and gyms.",
    services: ["Linen Cleaning", "Uniform Laundry", "Bulk Laundry Processing"],
  },
  {
    title: "Specialty Laundry",
    description:
      "Cleaning services focused on specific items such as carpets, curtains, wedding dresses, shoes, or uniforms.",
    services: ["Carpet Cleaning", "Curtain Cleaning", "Wedding Dress Cleaning"],
  },
  {
    title: "Franchise Laundry",
    description:
      "Laundry business operated under an established brand with standardized processes and support.",
    services: ["Wash and Fold", "Dry Cleaning", "Pickup and Delivery"],
  },
  {
    title: "On-Demand Laundry",
    description:
      "App-based or online laundry service that allows customers to schedule cleaning and delivery conveniently.",
    services: ["Online Booking", "Laundry Pickup", "Express Delivery"],
  },
  {
    title: "Ironing and Pressing",
    description:
      "Professional garment pressing and wrinkle removal services without full washing.",
    services: ["Garment Ironing", "Steam Pressing", "Suit Pressing"],
  },
  {
    title: "Industrial Laundry",
    description:
      "High-capacity laundering of uniforms, linens, and textiles for industrial and institutional clients.",
    services: [
      "Uniform Laundry",
      "Industrial Linen Cleaning",
      "Textile Sanitization",
    ],
  },
] as const;

const storeSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  category: z.string().min(1, "Store category is required"),
  location: z.string().min(1, "Store location is required"),
  latitude: z.string(),
  longitude: z.string(),
  opening: z.string().min(1, "Opening time is required"),
  closing: z.string().min(1, "Closing time is required"),
  logo: z.string().min(1, "Store logo is required"),
  coverImage: z.string().min(1, "Cover image is required"),
  radius: z.string().optional(),
  serviceNames: z.array(z.string()).optional(),
  daysOff: z.array(z.number()).optional(),
});

export type StoreFormValues = z.infer<typeof storeSchema> & {
  daysOff: number[];
};

const DAYS = [
  { value: 7, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

interface StoreFormProps {
  onBack: () => void;
  onSubmit: (store: StoreFormValues) => Promise<void>;
  isCreating: boolean;
}

export function StoreForm({ onBack, onSubmit, isCreating }: StoreFormProps) {
  const [daysOff, setDaysOff] = useState<number[]>([]);
  const form = useForm({
    defaultValues: {
      name: "",
      category: "",
      location: "",
      latitude: "",
      longitude: "",
      opening: "",
      closing: "",
      logo: "",
      coverImage: "",
      radius: "",
      serviceNames: [],
    },
    validators: {
      //@ts-expect-error error with zod type
      onSubmit: storeSchema,
    },
    onSubmit: async ({ value }) => {
      const lat = Number(value.latitude);
      const lng = Number(value.longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        return;
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return;
      }

      await onSubmit({ ...value, daysOff });
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
        <Field>
          <FieldLabel>Store Branding</FieldLabel>
          <div className="relative rounded-xl overflow-hidden border">
            <form.Field name="coverImage">
              {(field) => (
                <CoverImageUpload
                  value={field.state.value}
                  onChange={(url) => field.handleChange(url)}
                />
              )}
            </form.Field>
            <div className="absolute bottom-2 left-2 z-10">
              <form.Field name="logo">
                {(field) => (
                  <CloudinaryUpload
                    value={field.state.value}
                    onChange={(url) => field.handleChange(url)}
                    className="!size-16 rounded-full shadow-lg border-2 border-background"
                  />
                )}
              </form.Field>
            </div>
          </div>
          <form.Field name="coverImage">
            {(field) =>
              field.state.meta.errors.length > 0 && (
                <FieldError errors={field.state.meta.errors} />
              )
            }
          </form.Field>
          <form.Field name="logo">
            {(field) =>
              field.state.meta.errors.length > 0 && (
                <FieldError errors={field.state.meta.errors} />
              )
            }
          </form.Field>
        </Field>

        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Store Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Laundry Lane Downtown"
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="category">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Store Category</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value!);
                    form.setFieldValue(
                      // @ts-expect-error error
                      "serviceNames",
                      CATEGORIES.find((cat) => cat.title === value)?.services,
                    );
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.title} value={cat.title}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="location">
          {(field) => (
            <LocationField
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
              isInvalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
              onSelectLocation={(location, lat, lng) => {
                form.setFieldValue("location", location);
                form.setFieldValue("latitude", lat);
                form.setFieldValue("longitude", lng);
              }}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="opening">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Opening Time</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="time"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="closing">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Closing Time</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="time"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>
        </div>

        <form.Field name="radius">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Serving Radius (km)</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 10"
              />
            </Field>
          )}
        </form.Field>

        <Field>
          <FieldLabel>Days Closed</FieldLabel>
          <FieldDescription className="text-muted-foreground text-xs">
            Select days the store is closed
          </FieldDescription>
          <DaysOffCombobox daysOff={daysOff} onChange={setDaysOff} />
        </Field>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isCreating}
          >
            Back
          </Button>
          <form.Subscribe>
            {({ isSubmitting }) => (
              <Button
                type="submit"
                disabled={isSubmitting || isCreating}
                className="flex-1"
              >
                {(isSubmitting || isCreating) && <Spinner />}
                Create Store
              </Button>
            )}
          </form.Subscribe>
        </div>
      </FieldGroup>
    </form>
  );
}

function DaysOffCombobox({
  daysOff,
  onChange,
}: {
  daysOff: number[];
  onChange: (days: number[]) => void;
}) {
  const chipsRef = useComboboxAnchor();

  return (
    <Combobox value={daysOff} onValueChange={onChange} multiple autoHighlight>
      <ComboboxChips ref={chipsRef}>
        <ComboboxValue>
          {daysOff.map((day) => {
            const dayLabel = DAYS.find((d) => d.value === day)?.label;
            return <ComboboxChip key={day}>{dayLabel}</ComboboxChip>;
          })}
        </ComboboxValue>
        <ComboboxChipsInput placeholder="Select days off..." />
      </ComboboxChips>
      <ComboboxContent anchor={chipsRef}>
        <ComboboxList>
          {DAYS.map((day) => (
            <ComboboxItem key={day.value} value={day.value}>
              {day.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function CoverImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target?.result as string);
      reader.readAsDataURL(file);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("cloud_name", CLOUD_NAME);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      onChange(data.secure_url);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {value ? (
        <div className="relative w-full h-28">
          <Image src={value} alt="Cover image" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 size-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors z-10"
          >
            <XIcon className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full h-28 items-center justify-center rounded-t-xl border-b border-dashed bg-muted/30 hover:bg-accent transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Spinner className="size-5" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImageIcon className="size-6" />
              <span className="text-xs">Cover Image</span>
            </div>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function LocationField({
  value,
  onChange,
  onBlur,
  isInvalid,
  onSelectLocation,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  isInvalid: boolean;
  onSelectLocation: (location: string, lat: string, lng: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: suggestions, isFetching } = useQuery({
    ...getAddressAutocompleteOptions({ query: { query: debouncedSearch } }),
    enabled: debouncedSearch.length >= 2,
  });
  const items = (suggestions ?? []) as Array<{
    properties?: {
      name?: string;
      formatted?: string;
      address_line1?: string;
      lat?: number;
      lon?: number;
      place_id?: string;
    };
  }>;

  const showDropdown = open && items.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor="location">Store Location</FieldLabel>
      <div ref={ref} className="relative">
        <Input
          id="location"
          name="location"
          value={value}
          onBlur={onBlur}
          onChange={(e) => {
            onChange(e.target.value);
            setSearchTerm(e.target.value);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for a location..."
        />
        {isFetching && (
          <Loader2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
        )}
        {showDropdown && (
          <div className="absolute z-50 top-full mt-1 w-full rounded-lg border bg-popover text-popover-foreground shadow-md max-h-60 overflow-auto">
            {items.map((item, i) => {
              const props = item.properties;
              const name = props?.name ?? "";
              const formatted = props?.formatted ?? props?.address_line1 ?? "";
              return (
                <button
                  key={props?.place_id ?? i}
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const loc = formatted || name;
                    onChange(loc);
                    onSelectLocation(
                      loc,
                      props?.lat != null ? String(props.lat) : "",
                      props?.lon != null ? String(props.lon) : "",
                    );
                    setOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <MapPinIcon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{name}</p>
                    {formatted && (
                      <p className="text-muted-foreground text-xs truncate">
                        {formatted}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <FieldError errors={[]} />
    </Field>
  );
}
