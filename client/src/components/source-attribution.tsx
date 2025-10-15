// Source Attribution Component for E-E-A-T and LLM/AEO Optimization
// Provides credible source citations for AI factuality and trustworthiness

import { ExternalLink, Shield, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SourceAttributionProps {
  sources: Array<{
    title: string;
    organization: string;
    url?: string;
    date?: string;
    type?: "government" | "research" | "industry" | "news";
  }>;
  title?: string;
  className?: string;
}

export default function SourceAttribution({
  sources,
  title = "Sources & References",
  className = ""
}: SourceAttributionProps) {
  const getIcon = (type?: string) => {
    switch (type) {
      case "government":
        return Shield;
      case "research":
        return Award;
      default:
        return ExternalLink;
    }
  };

  const getTypeBadge = (type?: string) => {
    const badges = {
      government: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      research: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      industry: "bg-green-500/10 text-green-600 border-green-500/20",
      news: "bg-orange-500/10 text-orange-600 border-orange-500/20"
    };
    return type ? badges[type as keyof typeof badges] : "";
  };

  const getTypeLabel = (type?: string) => {
    const labels = {
      government: "Government",
      research: "Research",
      industry: "Industry",
      news: "News"
    };
    return type ? labels[type as keyof typeof labels] : "";
  };

  return (
    <Card className={`bg-muted/50 ${className}`}>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {title}
        </h3>

        <div className="space-y-3">
          {sources.map((source, index) => {
            const Icon = getIcon(source.type);

            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                <div className="flex-shrink-0 mt-1">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                      >
                        {source.title}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <span className="font-medium text-foreground">
                        {source.title}
                      </span>
                    )}

                    {source.type && (
                      <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${getTypeBadge(source.type)}`}>
                        {getTypeLabel(source.type)}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {source.organization}
                    {source.date && ` • ${source.date}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4 italic">
          All information is sourced from credible, authoritative sources to ensure accuracy and trustworthiness.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Generate Citation schema for search engines
 * Enhances E-E-A-T signals
 */
export function getCitationSchema(sources: SourceAttributionProps["sources"]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "citation": sources.map((source) => ({
      "@type": "CreativeWork",
      "name": source.title,
      "publisher": {
        "@type": "Organization",
        "name": source.organization
      },
      ...(source.url && { "url": source.url }),
      ...(source.date && { "datePublished": source.date })
    }))
  };
}
