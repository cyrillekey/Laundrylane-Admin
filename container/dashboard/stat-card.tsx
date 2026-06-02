import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  TrendingUpDown,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number | null;
  loading?: boolean;
  className?: string;
  href?: string;
}

export function StatCard({
  title,
  value,
  trend,
  loading,
  className,
  href,
}: StatCardProps) {
  const isPositive = trend != null && trend >= 0;

  if (loading) {
    return (
      <Card className={cn("flex-1 min-w-0", className)}>
        <CardContent className="flex items-start justify-between gap-4 px-6 py-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-28" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </CardContent>
        {href && (
          <CardFooter className="w-full h-full">
            <div className="flex flex-row items-center justify-between h-full w-full">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-4" />
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn("flex-1 min-w-0", className)}>
      <CardContent className="flex items-start justify-between gap-4 px-6 py-2">
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{title}</span>
            {trend != null && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium",
                  !trend || trend == 0
                    ? "text-muted-foreground"
                    : isPositive
                      ? "text-emerald-600"
                      : "text-red-600",
                )}
              >
                {!trend || trend == 0 ? (
                  <TrendingUpDown />
                ) : isPositive ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="w-full h-full">
        {href && (
          <Link href={href} className="w-full h-full">
            <div className="flex flex-row items-center justify-between h-full w-full">
              <span className="font-semibold">View More</span>
              <ArrowRight className="size-4" />
            </div>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
