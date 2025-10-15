// FAQ Section Component for LLM/AEO Optimization
// Implements FAQPage schema for voice search and AI citation

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs: FAQItem[];
  className?: string;
}

export default function FAQSection({ title, subtitle, faqs, className = "" }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {title && (
            <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-muted-foreground text-center mb-12">
              {subtitle}
            </p>
          )}

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border border-border hover:border-primary transition-colors cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-lg flex-1">
                      {faq.question}
                    </h3>
                    <button
                      className="flex-shrink-0 text-primary"
                      aria-label={openIndex === index ? "Collapse answer" : "Expand answer"}
                    >
                      {openIndex === index ? (
                        <ChevronUp size={24} />
                      ) : (
                        <ChevronDown size={24} />
                      )}
                    </button>
                  </div>

                  {openIndex === index && (
                    <div className="mt-4 text-muted-foreground leading-relaxed">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Generate FAQPage schema for a given set of FAQs
 * Use with injectSchema() from @/lib/schema
 */
export function getFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
