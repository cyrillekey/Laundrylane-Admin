import { type ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: number | null;
  rightAction?: ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  trend,
  rightAction,
  className,
}: StatCardProps) {
  const isPositive = trend != null && trend >= 0;

  return (
    <Card className={cn("flex-1 min-w-0", className)}>
      <CardContent className="flex items-start justify-between gap-4 px-6 py-2">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              iconClassName ?? "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            {(description || trend != null) && (
              <div className="flex items-center gap-1.5 mt-0.5">
                {trend != null && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-medium",
                      isPositive ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="size-3.5" />
                    ) : (
                      <ArrowDownRight className="size-3.5" />
                    )}
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                )}
                {description && (
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {rightAction && (
          <div className="shrink-0">{rightAction}</div>
        )}
      </CardContent>
    </Card>
  );
}
