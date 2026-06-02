"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getCatalogServiceTypesOptions } from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { Input } from "@/components/ui/input";
import { ServiceTypesTable } from "@/container/service-types/service-types-table";
import { ServiceTypesCreateDialog } from "@/container/forms/service-types/service-types-create-dialog";

const ServiceTypesPage = () => {
  const { selectedStoreId } = useSelectedStore();
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    ...getCatalogServiceTypesOptions({
      query: { storeId: selectedStoreId ?? undefined },
    }),
    enabled: !!selectedStoreId,
  });

  const serviceTypes = useMemo(() => {
    const items = data ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.serviceTimelines?.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Service Types</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage service types offered in your store
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search service types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <ServiceTypesCreateDialog />
        </div>
      </div>
      <ServiceTypesTable serviceTypes={serviceTypes} isPending={isPending} />
    </div>
  );
};

export default ServiceTypesPage;
