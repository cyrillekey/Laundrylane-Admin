"use client";

import { SearchIcon, MessageSquare, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import AuthenticationService from "@/services/tokenService";
import { useQuery } from "@tanstack/react-query";
import {
  getChatSessionsOptions,
  getCustomersOptions,
} from "@/queries/@tanstack/react-query.gen";
import { useState } from "react";

interface ChatSidebarProps {
  tab: string;
  onTabChange: (tab: string) => void;
  activeId: number | null;
  onSelectSession: (id: number) => void;
  creatingSession: boolean;
  onStartChat: (customerId: number) => void;
}

export function ChatSidebar({
  tab,
  onTabChange,
  activeId,
  onSelectSession,
  creatingSession,
  onStartChat,
}: ChatSidebarProps) {
  const user = AuthenticationService.getUser();
  const { data: sessionsResponse, isLoading: loadingSessions } = useQuery({
    ...getChatSessionsOptions(),
  });
  const [customerSearch, setCustomerSearch] = useState<string>();
  const { data: customersResponse } = useQuery({
    ...getCustomersOptions({
      query: { search: customerSearch || undefined, limit: 50 },
    }),
  });
  const sessions = sessionsResponse ?? [];
  const customers = customersResponse?.customers ?? [];
  return (
    <div className="flex w-80 shrink-0 flex-col border-r bg-muted/20">
      <Tabs
        value={tab}
        onValueChange={onTabChange}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="border-b p-3">
          <TabsList className="h-auto w-full gap-1 p-1">
            <TabsTrigger value="conversations" className="flex-1 text-xs">
              Conversations
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex-1 text-xs">
              Customers
            </TabsTrigger>
          </TabsList>
        </div>

        {tab === "conversations" && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="border-b p-3">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-8" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="size-5" />
                </div>
              ) : sessions.length > 0 ? (
                sessions.map((session) => {
                  const member = session.members?.find(
                    (m) => m.userId !== user?.id,
                  );
                  const name = member?.user?.name ?? "Unknown";
                  const lastMsg =
                    session.lastMessage?.message ?? "No messages yet";
                  const time = session.lastMessage?.createdat
                    ? new Date(
                        session.lastMessage.createdat,
                      ).toLocaleDateString()
                    : "";
                  const unread =
                    session.lastMessage &&
                    !session.lastMessage.read &&
                    session.lastMessage.senderId !== user?.id;

                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => onSelectSession(session.id!)}
                      className={cn(
                        "flex w-full flex-col gap-1 border-b p-3 text-left text-sm transition-colors hover:bg-accent",
                        activeId === session.id && "bg-accent",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="line-clamp-1 flex-1 text-xs text-muted-foreground">
                          {lastMsg}
                        </span>
                        {unread && (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <MessageSquare className="size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No conversations yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Switch to Customers to start a new chat
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "customers" && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="border-b p-3">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center gap-3 border-b p-3"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {(customer.name ?? customer.email ?? "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {customer.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {customer.email}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={creatingSession}
                      onClick={() => onStartChat(customer.id!)}
                    >
                      <MessageCircle className="size-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <MessageSquare className="size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {customerSearch
                      ? "No customers match your search"
                      : "No customers found"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
