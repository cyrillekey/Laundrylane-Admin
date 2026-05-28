"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Group,
  CoinsIcon,
  StoreIcon,
  ListOrdered,
  Shirt,
  Clock,
  MessageCircle,
  LifeBuoy,
  BookOpen,
} from "lucide-react";

import { NavCategories } from "@/components/sidebar/nav-categories";
import { NavUser } from "@/components/sidebar/nav-user";
import { StoreSwitcher } from "@/components/sidebar/store-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const categories = [
  {
    label: "Dashboard",
    items: [{ title: "Overview", url: "/app", icon: LayoutDashboard }],
  },
  {
    label: "Orders",
    items: [
      {
        title: "Orders",
        url: "/app/orders",
        icon: ShoppingBag,
        items: [
          { title: "Active", url: "/app/orders?status=active" },
          { title: "History", url: "/app/orders?status=history" },
        ],
      },
    ],
  },
  {
    label: "Customers",
    items: [{ title: "Customers", url: "/app/customers", icon: Group }],
  },
  {
    label: "Payments",
    items: [
      { title: "Transactions", url: "/app/transactions", icon: CoinsIcon },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Stores", url: "/app/stores", icon: StoreIcon },
      { title: "Catalog", url: "/app/catalog", icon: ListOrdered },
      { title: "Service Types", url: "/app/service-types", icon: Clock },
      { title: "Cloth Types", url: "/app/cloth-types", icon: Shirt },
    ],
  },
  {
    label: "Support",
    items: [
      { title: "Support Chat", url: "/app/support/chat", icon: MessageCircle },
      { title: "Help Center", url: "/app/support/help", icon: LifeBuoy },
      { title: "Documentation", url: "/app/support/docs", icon: BookOpen },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <StoreSwitcher />
      </SidebarHeader>
      <SidebarContent className="gap-1 pb-2">
        <NavCategories categories={categories} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
