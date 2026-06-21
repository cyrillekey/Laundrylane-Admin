"use client";

import { APIProvider, Map, Marker, Circle } from "@vis.gl/react-google-maps";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ZonePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export function ZonePreviewDialog({
  open,
  onOpenChange,
  name,
  latitude,
  longitude,
  radius,
}: ZonePreviewDialogProps) {
  if (!latitude || !longitude) return null;

  const center = { lat: latitude, lng: longitude };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{name ?? "Delivery Zone"}</DialogTitle>
          <DialogDescription>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
            {radius ? ` \u2022 ${radius} km radius` : ""}
          </DialogDescription>
        </DialogHeader>
        {apiKey ? (
          <APIProvider apiKey={apiKey}>
            <div className="w-full h-[400px] rounded-lg border overflow-hidden">
              <Map
                center={center}
                defaultZoom={11}                
                gestureHandling="greedy"
                mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
                className="w-full h-full"
              >
                <Marker position={center} title={name ?? "Delivery Zone"} />
                {radius && radius > 0 && (
                  <Circle
                    center={center}
                    radius={radius * 1000}
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
        ) : (
          <div className="w-full h-[400px] rounded-lg border flex items-center justify-center text-sm text-muted-foreground">
            Google Maps API key not configured. Set{" "}
            <code className="mx-1 px-1 py-0.5 bg-muted rounded text-xs">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </code>
            in your environment.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
