"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: {
    title: string;
    url: string;
  }[];
}

interface NavCategory {
  label: string;
  items: NavItem[];
}

function isActiveUrl(pathname: string, url: string): boolean {
  return pathname == url;
}

export function NavCategories({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();

  return (
    <>
      {categories.map((category) => (
        <SidebarGroup key={category.label} className="p-1 pb-0">
          <SidebarGroupLabel className="text-xs font-medium tracking-wider uppercase">
            {category.label}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-0.5">
            {category.items.map((item) => {
              const active = isActiveUrl(pathname, item.url);
              const hasSubItems = item.items && item.items.length > 0;

              if (!hasSubItems) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.url}>
                        {item.icon && <item.icon className="size-4" />}
                        <span className="text-md font-normal">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={active}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={active}>
                        {item.icon && <item.icon className="size-4" />}
                        <span className="text-md font-normal">
                          {item.title}
                        </span>
                        <ChevronRight className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="gap-0.5">
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              size="sm"
                              isActive={isActiveUrl(pathname, subItem.url)}
                            >
                              <Link href={subItem.url}>
                                <span className="text-xs font-normal">
                                  {subItem.title}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
