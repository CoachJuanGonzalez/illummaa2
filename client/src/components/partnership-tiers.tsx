import { Rocket, Star, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PartnershipTiers() {
  const scrollToAssessment = () => {
    const element = document.getElementById("developer-qualification");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const tiers = [
    {
      name: "Pioneer",
      units: "50-99 units",
      icon: <Rocket className="text-blue-600" size={32} />,
      iconBg: "bg-blue-100",
      features: [
        "Volume pricing discounts",
        "Dedicated project support", 
        "Standard delivery timelines",
        "Quality assurance program"
      ],
      buttonVariant: "outline" as const,
      buttonText: "Learn More"
    },
    {
      name: "Preferred",
      units: "100-299 units",
      icon: <Star className="text-primary" size={32} />,
      iconBg: "bg-primary/10",
      features: [
        "All Pioneer benefits",
        "Custom design modifications",
        "Financing assistance",
        "Priority production scheduling",
        "Dedicated account manager"
      ],
      buttonVariant: "default" as const,
      buttonText: "Get Started",
      popular: true
    },
    {
      name: "Elite", 
      units: "300+ units",
      icon: <Crown className="text-yellow-600" size={32} />,
      iconBg: "bg-yellow-100",
      features: [
        "All Preferred benefits",
        "Exclusive custom designs",
        "Turnkey community solutions",
        "Co-marketing opportunities",
        "Executive relationship team"
      ],
      buttonVariant: "outline" as const,
      buttonText: "Contact Us"
    }
  ];

  return (
    <section id="partnership-tiers" className="py-20 partnership-section" data-testid="section-partnership">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-partnership-title">
            Scale Your Development with Industrial Precision
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-partnership-subtitle">
            Choose the partnership tier that matches your development scale and unlock exclusive benefits.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="container-partnership-tiers">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className={`card-hover bg-card rounded-2xl p-8 shadow-xl border-2 relative ${
                tier.popular ? 'border-primary' : 'border-transparent'
              }`}
              data-testid={`card-tier-${tier.name.toLowerCase()}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2" data-testid="badge-most-popular">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${tier.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {tier.icon}
                </div>
                <h3 className="font-display font-bold text-2xl mb-2" data-testid={`heading-tier-${tier.name.toLowerCase()}-name`}>
                  {tier.name}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-tier-${tier.name.toLowerCase()}-units`}>
                  {tier.units}
                </p>
              </div>
              
              <ul className="space-y-3 mb-8" data-testid={`list-tier-${tier.name.toLowerCase()}-features`}>
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center" data-testid={`feature-tier-${tier.name.toLowerCase()}-${featureIndex}`}>
                    <Check className="text-green-500 mr-3" size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={tier.buttonVariant}
                className={`w-full ${tier.buttonVariant === 'default' ? 'btn-primary' : ''}`}
                data-testid={`button-tier-${tier.name.toLowerCase()}`}
              >
                {tier.buttonText}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 px-4">
          <Button 
            onClick={scrollToAssessment} 
            size="lg"
            className="btn-primary text-white font-semibold text-sm xs:text-base sm:text-lg w-full max-w-xs xs:max-w-sm sm:max-w-md mx-auto rounded-2xl hero-cta-mobile whitespace-normal leading-tight"
            data-testid="button-schedule-assessment"
          >
            Schedule Partnership Assessment
          </Button>
        </div>
      </div>
    </section>
  );
}
