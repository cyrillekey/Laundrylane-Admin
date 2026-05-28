"use client";

import * as React from "react";
import {
  LayoutDashboard,
  StoreIcon,
  Group,
  ShoppingBag,
  CoinsIcon,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { StoreSwitcher } from "@/components/sidebar/store-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/app",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Orders",
      url: "/app/orders",
      icon: ShoppingBag,
      isActive: true,
    },
    {
      title: "Customers",
      url: "/app/customers",
      icon: Group,
      isActive: true,
    },
    {
      title: "Stores",
      url: "/app/stores",
      icon: StoreIcon,
      isActive: true,
    },
    {
      title: "Transactions",
      url: "/app/transactions",
      icon: CoinsIcon,
      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <StoreSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
