// Comparison Table Component for LLM/AEO Optimization
// Structured data comparison for AI parsing and voice search

import { Check, X, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ComparisonColumn {
  title: string;
  subtitle?: string;
  highlighted?: boolean;
  badge?: string;
}

export interface ComparisonRow {
  feature: string;
  values: (string | boolean | "partial")[];
  description?: string;
}

interface ComparisonTableProps {
  title?: string;
  subtitle?: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  className?: string;
}

export default function ComparisonTable({
  title,
  subtitle,
  columns,
  rows,
  className = ""
}: ComparisonTableProps) {
  const renderCellValue = (value: string | boolean | "partial") => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-6 w-6 text-green-500 mx-auto" />
      ) : (
        <X className="h-6 w-6 text-gray-400 mx-auto" />
      );
    }

    if (value === "partial") {
      return <Minus className="h-6 w-6 text-yellow-500 mx-auto" />;
    }

    return (
      <span className="text-sm text-center block">{value}</span>
    );
  };

  return (
    <div className={className}>
      {title && (
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left bg-muted font-semibold border border-border">
                Feature
              </th>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`p-4 text-center border border-border ${
                    column.highlighted
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {column.badge && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground font-medium">
                        {column.badge}
                      </span>
                    )}
                    <span className="font-semibold">{column.title}</span>
                    {column.subtitle && (
                      <span className="text-sm text-muted-foreground font-normal">
                        {column.subtitle}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-muted/50 transition-colors">
                <td className="p-4 border border-border">
                  <div>
                    <div className="font-medium">{row.feature}</div>
                    {row.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {row.description}
                      </div>
                    )}
                  </div>
                </td>
                {row.values.map((value, colIndex) => (
                  <td
                    key={colIndex}
                    className={`p-4 text-center border border-border ${
                      columns[colIndex]?.highlighted ? "bg-primary/5" : ""
                    }`}
                  >
                    {renderCellValue(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {columns.map((column, colIndex) => (
          <Card
            key={colIndex}
            className={column.highlighted ? "border-primary border-2" : ""}
          >
            <CardHeader>
              <div className="flex flex-col items-center gap-2">
                {column.badge && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground font-medium">
                    {column.badge}
                  </span>
                )}
                <CardTitle className="text-center">{column.title}</CardTitle>
                {column.subtitle && (
                  <p className="text-sm text-muted-foreground text-center">
                    {column.subtitle}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{row.feature}</div>
                      {row.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {row.description}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {renderCellValue(row.values[colIndex])}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Generate ComparisonTable schema for search engines
 * Helps AI understand structured comparisons
 */
export function getComparisonSchema(
  columns: ComparisonColumn[],
  rows: ComparisonRow[],
  pageUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": pageUrl,
    "mainEntity": {
      "@type": "Table",
      "about": "Comparison Table",
      "columns": columns.map((col) => col.title),
      "rows": rows.map((row) => ({
        "@type": "TableRow",
        "cells": [row.feature, ...row.values]
      }))
    }
  };
}
