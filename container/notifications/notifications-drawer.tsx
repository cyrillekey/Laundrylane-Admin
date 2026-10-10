"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellRing, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  getNotificationsOptions,
  getNotificationsQueryKey,
  getNotificationsUnreadCountOptions,
  getNotificationsUnreadCountQueryKey,
  putNotificationsMarkAllReadMutation,
  putNotificationsMarkReadByIdMutation,
} from "@/queries/@tanstack/react-query.gen";

function timeAgo(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function NotificationsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: unreadData } = useQuery({
    ...getNotificationsUnreadCountOptions(),
  });
  const unreadCount = unreadData?.count ?? 0;

  const { data, isPending } = useQuery({
    ...getNotificationsOptions(),
    enabled: open,
  });

  const notifications = useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) =>
          new Date(b.createdat ?? 0).getTime() -
          new Date(a.createdat ?? 0).getTime(),
      ),
    [data],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: getNotificationsQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getNotificationsUnreadCountQueryKey(),
    });
  };

  const { mutate: markRead } = useMutation({
    ...putNotificationsMarkReadByIdMutation(),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error("Error!", {
        description: (error as Error)?.message || "Failed to update notification",
      });
    },
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    ...putNotificationsMarkAllReadMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error("Error!", {
        description: (error as Error)?.message || "Failed to update notifications",
      });
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <div className="flex items-center justify-between gap-2 pr-8">
            <div>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                  : "You're all caught up"}
              </SheetDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                disabled={markingAll}
                onClick={() => markAllRead({})}
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <BellRing className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground">
                New updates will appear here.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!notification.read && notification.id != null) {
                        markRead({ path: { id: notification.id } });
                      }
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
                      notification.read
                        ? "hover:bg-muted/50"
                        : "bg-muted/60 hover:bg-muted",
                    )}
                  >
                    <span className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bell className="size-4 text-primary" />
                      {!notification.read && (
                        <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-background" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            "text-sm",
                            notification.read
                              ? "font-normal"
                              : "font-semibold",
                          )}
                        >
                          {notification.title ?? "Notification"}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {timeAgo(notification.createdat)}
                        </span>
                      </span>
                      {notification.message && (
                        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                          {notification.message}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
