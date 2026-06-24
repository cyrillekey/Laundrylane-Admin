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
  ShoppingBasket,
  MapPin,
  ScrollText,
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
      {
        title: "Point of Sale",
        url: "/app/pos",
        icon: ShoppingBasket
      }
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
      { title: "Store", url: "/app/stores", icon: StoreIcon },
      { title: "Catalog", url: "/app/catalog", icon: ListOrdered },
      { title: "Service Types", url: "/app/service-types", icon: Clock },
      { title: "Cloth Types", url: "/app/cloth-types", icon: Shirt },
      { title: "Delivery Zones", url: "/app/delivery-zones", icon: MapPin },
    ],
  },  
  {
    label: "Support",
    items: [
      { title: "Support Chat", url: "/app/support/chat", icon: MessageCircle },
      { title: "Help Center", url: "/app/support/help", icon: LifeBuoy },      
      {
        title: "Policy & Support",
        url: "/app/support",
        icon: ScrollText,
        items: [
          { title: "Terms and Conditions", url: "/app/support/terms" },
          { title: "Privacy Policy", url: "/app/support/privacy" },
          { title: "Support Contacts", url: "/app/support/contacts" },
          { title: "FAQ", url: "/app/support/faq" },
        ],
      },
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
