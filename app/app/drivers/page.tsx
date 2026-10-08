"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getDeliveryDriversOptions } from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { Input } from "@/components/ui/input";
import { DriversTable } from "@/container/drivers/drivers-table";
import { DriverCreateDialog } from "@/container/forms/drivers/driver-create-dialog";

const DriversPage = () => {
  const { selectedStoreId } = useSelectedStore();
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    ...getDeliveryDriversOptions({
      query: { storeId: selectedStoreId ?? undefined },
    }),
    enabled: !!selectedStoreId,
  });

  const drivers = useMemo(() => {
    const items = data ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.vehicleType?.toLowerCase().includes(q) ||
        item.vehicleNumber?.toLowerCase().includes(q) ||
        item.deliveryType?.toLowerCase().includes(q) ||
        String(item.userId ?? "").includes(q),
    );
  }, [data, search]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Drivers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage delivery drivers and their vehicle details
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search drivers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <DriverCreateDialog />
        </div>
      </div>
      <DriversTable drivers={drivers} isPending={isPending} />
    </div>
  );
};

export default DriversPage;
