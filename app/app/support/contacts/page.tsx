"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getSupportContactsOptions } from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { Input } from "@/components/ui/input";
import { SupportContactsTable } from "@/container/support-contacts/support-contacts-table";
import { SupportContactCreateDialog } from "@/container/forms/support-contacts/support-contacts-create-dialog";

const ContactsPage = () => {
  const { selectedStoreId } = useSelectedStore();
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    ...getSupportContactsOptions({
      query: { storeId: selectedStoreId ?? undefined },
    }),
    enabled: !!selectedStoreId,
  });

  const contacts = useMemo(() => {
    const items = data ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.value?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Support Contacts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage phone numbers, emails, and social media links for customer support
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <SupportContactCreateDialog />
        </div>
      </div>
      <SupportContactsTable contacts={contacts} isPending={isPending} />
    </div>
  );
};

export default ContactsPage;
