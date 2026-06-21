"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getDeliveryZonesOptions } from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { Input } from "@/components/ui/input";
import { DeliveryZonesTable } from "@/container/delivery-zones/delivery-zones-table";
import { DeliveryZonesCreateDialog } from "@/container/forms/delivery-zones/delivery-zones-create-dialog";

const DeliveryZonesPage = () => {
  const { selectedStoreId } = useSelectedStore();
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    ...getDeliveryZonesOptions({
      query: { storeId: selectedStoreId ?? undefined },
    }),
    enabled: !!selectedStoreId,
  });

  const zones = useMemo(() => {
    const items = data ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Delivery Zones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define delivery zones with pricing and operating hours
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search zones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <DeliveryZonesCreateDialog />
        </div>
      </div>
      <DeliveryZonesTable zones={zones} isPending={isPending} />
    </div>
  );
};

export default DeliveryZonesPage;
