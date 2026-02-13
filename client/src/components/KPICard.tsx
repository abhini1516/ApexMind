import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ElementType;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

export function KPICard({ title, value, change, icon: Icon, className, trend }: KPICardProps) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <div className={cn(
      "bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold font-display tracking-tight text-foreground">{value}</h3>
      </div>

      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-1 mt-2 text-xs font-semibold px-2 py-1 rounded-full w-fit",
          isPositive ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400" : 
          isNegative ? "text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400" :
          "text-muted-foreground bg-muted"
        )}>
          {isPositive && <ArrowUpRight className="w-3 h-3" />}
          {isNegative && <ArrowDownRight className="w-3 h-3" />}
          {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
          {Math.abs(change)}% vs last month
        </div>
      )}
    </div>
  );
}
