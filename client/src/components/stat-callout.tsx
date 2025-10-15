// Stat Callout Component for LLM/AEO Optimization
// Highlights key statistics in an AI-friendly, citation-ready format

import { TrendingUp, Award, Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCalloutProps {
  value: string | number;
  label: string;
  description?: string;
  icon?: "trending" | "award" | "clock" | "dollar";
  variant?: "default" | "primary" | "success" | "accent";
  className?: string;
}

export default function StatCallout({
  value,
  label,
  description,
  icon = "trending",
  variant = "default",
  className = ""
}: StatCalloutProps) {
  const icons = {
    trending: TrendingUp,
    award: Award,
    clock: Clock,
    dollar: DollarSign
  };

  const Icon = icons[icon];

  const variantStyles = {
    default: "bg-muted text-foreground",
    primary: "bg-primary/5 text-primary border-primary/20",
    success: "bg-green-500/5 text-green-600 border-green-500/20",
    accent: "bg-accent/5 text-accent border-accent/20"
  };

  return (
    <Card className={`${variantStyles[variant]} border-2 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${
            variant === "default"
              ? "bg-primary/10"
              : variant === "primary"
              ? "bg-primary/20"
              : variant === "success"
              ? "bg-green-500/20"
              : "bg-accent/20"
          }`}>
            <Icon className="h-8 w-8" />
          </div>
        </div>

        <div className="font-display font-bold text-5xl md:text-6xl mb-2">
          {value}
        </div>

        <div className="font-semibold text-lg mb-2">
          {label}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Multi-Stat Grid Component
 * Displays multiple statistics in a grid layout
 */
interface MultiStatGridProps {
  stats: Array<{
    value: string | number;
    label: string;
    description?: string;
    icon?: "trending" | "award" | "clock" | "dollar";
    variant?: "default" | "primary" | "success" | "accent";
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MultiStatGrid({
  stats,
  columns = 3,
  className = ""
}: MultiStatGridProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <StatCallout key={index} {...stat} />
      ))}
    </div>
  );
}
