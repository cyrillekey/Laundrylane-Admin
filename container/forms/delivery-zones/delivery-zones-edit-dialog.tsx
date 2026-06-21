"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { MapPinIcon, Loader2Icon } from "lucide-react";
import {
  putDeliveryZonesByIdMutation,
  getDeliveryZonesQueryKey,
  getAddressAutocompleteOptions,
} from "@/queries/@tanstack/react-query.gen";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { APIProvider, Map, Marker, Circle } from "@vis.gl/react-google-maps";
import z from "zod";

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const deliveryZoneSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      "Price must be a positive number",
    ),
  radius: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

interface DeliveryZoneEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: {
    id: number;
    name?: string;
    location?: string;
    price?: number;
    radius?: number;
    latitude?: number;
    longitude?: number;
    startTime?: string | null;
    endTime?: string | null;
  };
}

export function DeliveryZoneEditDialog({
  open,
  onOpenChange,
  zone,
}: DeliveryZoneEditDialogProps) {
  const queryClient = useQueryClient();

  const { mutateAsync: updateZone, isPending: isSubmitting } = useMutation({
    ...putDeliveryZonesByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getDeliveryZonesQueryKey() });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error!", {
        description:
          (error as Error)?.message || "Failed to update delivery zone",
      });
    },
  });

  const form = useForm({
    defaultValues: {
      name: zone.name ?? "",
      location: zone.location ?? "",
      price: zone.price != null ? String(zone.price) : "",
      radius: zone.radius != null ? String(zone.radius) : "",
      latitude: zone.latitude != null ? String(zone.latitude) : "",
      longitude: zone.longitude != null ? String(zone.longitude) : "",
      startTime: zone.startTime ?? "",
      endTime: zone.endTime ?? "",
    },
    validators: { onChange: deliveryZoneSchema },
    onSubmit: async ({ value }) => {
      await updateZone({
        path: { id: zone.id },
        body: {
          name: value.name.trim(),
          location: value.location.trim(),
          price: Number(value.price),
          radius: value.radius ? Number(value.radius) : null,
          latitude: value.latitude ? Number(value.latitude) : undefined,
          longitude: value.longitude ? Number(value.longitude) : undefined,
          startTime: value.startTime || null,
          endTime: value.endTime || null,
        },
      });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Delivery Zone</DialogTitle>
            <DialogDescription>Update delivery zone details</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="grid grid-cols-1 gap-4">
              <form.Field name="name">
                {(field) => (
                  <Field data-invalid={!!field.state.meta.errors?.length}>
                    <FieldLabel>Zone Name</FieldLabel>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="e.g. Nairobi CBD"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <form.Field name="location">
                {(field) => (
                  <LocationAutocomplete
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    isInvalid={!!field.state.meta.errors?.length}
                    onSelectLocation={(location, lat, lng) => {
                      field.handleChange(location);
                      form.setFieldValue("latitude", lat);
                      form.setFieldValue("longitude", lng);
                    }}
                  />
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <form.Field name="price">
                {(field) => (
                  <Field data-invalid={!!field.state.meta.errors?.length}>
                    <FieldLabel>Price (KES)</FieldLabel>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="e.g. 350"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="startTime">
                {(field) => (
                  <Field>
                    <FieldLabel>Start Time</FieldLabel>
                    <Input
                      type="time"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="endTime">
                {(field) => (
                  <Field>
                    <FieldLabel>End Time</FieldLabel>
                    <Input
                      type="time"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <form.Field name="radius">
                {(field) => (
                  <Field>
                    <FieldLabel>Radius (km)</FieldLabel>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="e.g. 5"
                    />
                  </Field>
                )}
              </form.Field>
            </div>
            <form.Subscribe>
              {({ values }) => (
                <MapPreview
                  lat={values.latitude}
                  lng={values.longitude}
                  radius={values.radius}
                />
              )}
            </form.Subscribe>
          </div>

          <form.Subscribe>
            {({ isSubmitting: formSubmitting }) => (
              <Button
                type="submit"
                disabled={formSubmitting || isSubmitting}
                className="w-full"
              >
                {(formSubmitting || isSubmitting) && <Spinner />}
                Update Zone
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MapPreview({
  lat,
  lng,
  radius,
}: {
  lat: string;
  lng: string;
  radius: string;
}) {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  const radiusNum = parseFloat(radius);

  if (!lat || !lng || isNaN(latNum) || isNaN(lngNum)) return null;
  if (!googleMapsApiKey) return null;

  const center = { lat: latNum, lng: lngNum };

  return (
    <div className="pt-2">
      <p className="text-sm font-medium text-muted-foreground mb-2">
        Area Preview
      </p>
      <APIProvider apiKey={googleMapsApiKey}>
        <div className="w-full h-[250px] rounded-lg border overflow-hidden">
          <Map
            defaultCenter={center}
            zoom={13}
            gestureHandling="greedy"
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
            className="w-full h-full"
          >
            <Marker position={center} />
            {!isNaN(radiusNum) && radiusNum > 0 && (
              <Circle
                center={center}
                radius={radiusNum * 1000}
                strokeColor="#2563eb"
                strokeOpacity={0.8}
                strokeWeight={2}
                fillColor="#3b82f6"
                fillOpacity={0.2}
              />
            )}
          </Map>
        </div>
      </APIProvider>
    </div>
  );
}

function LocationAutocomplete({
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
      <FieldLabel>Location</FieldLabel>
      <div ref={ref} className="relative">
        <Input
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
