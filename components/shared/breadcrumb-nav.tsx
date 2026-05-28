"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Fragment } from "react";

const labelMap: Record<string, string> = {
  orders: "Orders",
  customers: "Customers",
  transactions: "Transactions",
  stores: "Stores",
  catalog: "Catalog",
  "service-types": "Service Types",
  "cloth-types": "Cloth Types",
  settings: "Settings",
  support: "Support",
  chat: "Support Chat",
  help: "Help Center",
  docs: "Documentation",
};

function getSegmentLabel(segment: string): string {
  return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string }[] = [];
  let href = "";

  for (const segment of segments) {
    href += `/${segment}`;
    crumbs.push({ label: getSegmentLabel(segment), href });
  }

  if (crumbs.length === 0) return null;
  if (crumbs.length === 1) {
    crumbs[0].label = "Overview";
  }

  const links = crumbs.slice(0, -1);
  const current = crumbs[crumbs.length - 1];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/app">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {links.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link href={crumb.href}>{crumb.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{current.label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
