import { Quote, Users, Home, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  quote: string;
  impact?: string;
  initials: string;
  type: "developer" | "community" | "homeowner";
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Partnership Testimonials",
    role: "Development Partner Stories Coming Soon",
    quote:
      "We're actively working with development partners across Canada. Their success stories and community impact testimonials will be featured here.",
    impact: "Building stronger communities together",
    initials: "PT",
    type: "developer",
  },
  {
    id: "2",
    name: "Community Impact",
    role: "Real Stories from Real Communities",
    quote:
      "Our modular housing solutions are creating positive change in communities nationwide. Community member testimonials and impact stories coming soon.",
    impact: "Affordable housing creates opportunity",
    initials: "CI",
    type: "community",
  },
  {
    id: "3",
    name: "Homeowner Experiences",
    role: "Living in ILLÜMMAA Homes",
    quote:
      "Families are finding quality, affordable homes through our modular construction approach. Homeowner testimonials and photos coming soon.",
    impact: "Quality homes, happy families",
    initials: "HE",
    type: "homeowner",
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "developer":
      return <Users className="w-6 h-6 text-community-primary" />;
    case "community":
      return <Home className="w-6 h-6 text-community-primary" />;
    case "homeowner":
      return <Heart className="w-6 h-6 text-community-primary" />;
    default:
      return <Users className="w-6 h-6 text-community-primary" />;
  }
};

export default function CommunityTestimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-community-neutral/20 to-white" data-testid="section-testimonials">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
            Community-First Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real impact from development partners, communities, and homeowners
            across Canada
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="relative p-8 bg-white hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-community-primary/20"
            >
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="w-16 h-16 text-community-primary" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-16 h-16 bg-gradient-to-br from-community-primary to-community-accent">
                    <AvatarFallback className="text-white font-bold text-lg">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getIcon(testimonial.type)}
                      <h3 className="font-semibold text-lg">
                        {testimonial.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                    {testimonial.company && (
                      <p className="text-xs text-community-accent font-medium mt-1">
                        {testimonial.company}
                      </p>
                    )}
                  </div>
                </div>

                <blockquote className="text-muted-foreground leading-relaxed mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>

                {testimonial.impact && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm font-semibold text-community-primary">
                      {testimonial.impact}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md border border-community-primary/20">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-community-primary to-community-accent border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-700">
                Join Our Growing Community
              </p>
              <p className="text-xs text-gray-500">
                Partnership stories being collected
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}