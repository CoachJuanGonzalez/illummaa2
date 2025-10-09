import { User } from "lucide-react";

export default function LeadershipTeam() {
  const executives = [
    {
      name: "Baillargeon-Kemener Office",
      title: "Chairman",
      category: "Leadership"
    },
    {
      name: "Howard Smolar",
      title: "Managing Director", 
      category: "Operations"
    },
    {
      name: "Marvin Garellek",
      title: "Vice-President of Sales and Investments",
      category: "Finance"
    },
    {
      name: "Dan Hatahat",
      title: "Corporate Development",
      category: "Business Development"
    },
    {
      name: "Lili Zunhua",
      title: "Director and Production Partner",
      category: "Manufacturing and Sourcing"
    },
    {
      name: "Ian Lajoie",
      title: "Global Partnership Development",
      category: "Representation"
    },
    {
      name: "Choukhrate Rasoulev",
      title: "International Sales Director and Representation",
      category: "Business Development"
    },
    {
      name: "Juan Grey",
      title: "Chief Vision & Expansion Officer",
      category: "Brand & Creative Direction"
    },
    {
      name: "Coach Juan Gonzalez",
      title: "Chief Technology Officer & AI Innovation Strategist",
      category: "Innovation"
    }
  ];

  return (
    <section id="leadership" className="py-20 bg-background" data-testid="section-leadership">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-leadership-title">
            Leadership Team
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-leadership-subtitle">
            Experienced executives driving Canada's modular construction transformation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" data-testid="container-leadership-grid">
          {executives.map((executive, index) => (
            <div 
              key={index} 
              className="card-hover bg-card rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              data-testid={`card-executive-${index}`}
            >
              {/* Professional placeholder avatar */}
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <User className="text-primary" size={32} />
              </div>
              
              {/* Executive name */}
              <h3 className="font-bold text-lg text-center mb-2 text-foreground" data-testid={`name-executive-${index}`}>
                {executive.name}
              </h3>
              
              {/* Title/role */}
              <p className="text-muted-foreground text-center text-sm leading-relaxed" data-testid={`title-executive-${index}`}>
                {executive.title}
              </p>
              
              {/* Category badge */}
              <div className="mt-4 flex justify-center">
                <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full" data-testid={`category-executive-${index}`}>
                  {executive.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}