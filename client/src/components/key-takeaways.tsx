// Key Takeaways Component for LLM/AEO Optimization
// Provides concise, AI-friendly summaries for voice search and citations

import { Check, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KeyTakeawaysProps {
  title?: string;
  takeaways: string[];
  variant?: "default" | "highlighted";
  className?: string;
}

export default function KeyTakeaways({
  title = "Key Takeaways",
  takeaways,
  variant = "default",
  className = ""
}: KeyTakeawaysProps) {
  const isHighlighted = variant === "highlighted";

  return (
    <Card
      className={`${
        isHighlighted
          ? "bg-primary/5 border-primary/20"
          : "bg-muted"
      } ${className}`}
    >
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${isHighlighted ? "bg-primary/10" : "bg-primary/5"}`}>
            <Lightbulb className={`h-6 w-6 ${isHighlighted ? "text-primary" : "text-foreground"}`} />
          </div>
          <h3 className="font-display font-bold text-xl">{title}</h3>
        </div>

        <ul className="space-y-3">
          {takeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`rounded-full p-1 ${isHighlighted ? "bg-primary" : "bg-green-500"}`}>
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
              <span className="text-foreground leading-relaxed">{takeaway}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/**
 * Key Takeaways for Voice Search (Speakable Schema)
 * Generates SpeakableSpecification for voice assistants
 */
export function getSpeakableSchema(takeaways: string[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": pageUrl,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".key-takeaways"],
      "xpath": ["/html/body//*[@class='key-takeaways']"]
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": takeaways.map((takeaway, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": takeaway
      }))
    }
  };
}
