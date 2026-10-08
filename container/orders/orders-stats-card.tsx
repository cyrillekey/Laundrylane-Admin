"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BoxIcon, Coins, ShipIcon, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getStatsOrdersSummaryOptions } from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";

const OrdersStatisticsCard = () => {
  const { selectedStoreId } = useSelectedStore();
  const { data: summary, isLoading } = useQuery({
    ...getStatsOrdersSummaryOptions({
      query: { storeId: selectedStoreId ?? undefined },
    }),
    enabled: !!selectedStoreId,
  });

  const actions = [
    {
      title: "Orders",
      subtitle: summary?.totalOrders?.toLocaleString() ?? "0",
      caption: `${summary?.totalCompletedOrders ?? 0} completed this month`,
      cardIcon: <ShipIcon className="size-5" />,
    },
    {
      title: "Sales",
      subtitle: `KES ${summary?.totalSales?.toLocaleString() ?? 0}`,
      caption: "This month",
      cardIcon: <BoxIcon className="size-5" />,
    },
    {
      title: "Profit",
      subtitle: `KES ${summary?.totalProfit?.toLocaleString() ?? 0}`,
      caption: "This month",
      cardIcon: <Coins className="size-5" />,
    },
    {
      title: "Delivery Fees",
      subtitle: `KES ${summary?.totalDeliveryFees?.toLocaleString() ?? 0}`,
      caption: "This month",
      cardIcon: <ShoppingBag className="size-5" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="mx-auto w-full">
        <Card className="p-0">
          <CardContent className="flex items-center w-full lg:flex-nowrap flex-wrap px-0">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                className="lg:w-3/12 md:w-6/12 w-full border-e border-border last:border-e-0"
                key={index}
              >
                <div className="p-6">
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <Card className="p-0">
        <CardContent className="flex items-center w-full lg:flex-nowrap flex-wrap px-0">
          {actions.map((item, index) => {
            return (
              <div
                className="lg:w-3/12 md:w-6/12 w-full border-e border-border last:border-e-0"
                key={index}
              >
                <div className="p-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h5 className="text-base font-medium">{item.title}</h5>
                      <div
                        className={`p-3 rounded-full outline outline-border text-primary`}
                      >
                        {item.cardIcon}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h5 className="text-2xl font-semibold">
                        {item.subtitle}
                      </h5>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {item.caption}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
export default OrdersStatisticsCard;
