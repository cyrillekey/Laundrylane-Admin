"use client";

import { useParams } from "next/navigation";
import { OrderDetail } from "@/container/orders/order-detail";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  if (isNaN(id)) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Invalid order ID
      </div>
    );
  }

  return <OrderDetail id={id} />;
}
