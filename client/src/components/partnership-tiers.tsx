import { Home, Rocket, Star, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ConsumerForm from "@/components/consumer-form";

export default function PartnershipTiers() {
  const [showConsumerForm, setShowConsumerForm] = useState(false);

  const openConsumerForm = () => {
    setShowConsumerForm(true);
  };

  const scrollToAssessment = () => {
    const element = document.getElementById("developer-qualification");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const tiers = [
    {
      name: "Starter",
      units: "1-49 units",
      icon: <Home className="text-green-600" size={32} />,
      iconBg: "bg-green-100",
      features: [
        "Individual homes to small development projects",
        "Direct consultation with an ILLÜMMAA modular expert or an approved real estate partner (e.g., REMAX)",
        "Standard modular designs with digital customization options",
        "Competitive pricing: modular units from $99K CAD, fully-serviced homes from $269K CAD",
        "Factory precision manufacturing with superior quality control",
        "Rapid 72-hour on-site assembly for individual units",
        "Access to financing assistance and government housing programs"
      ],
      buttonVariant: "outline" as const,
      buttonText: "Get Started",
      action: openConsumerForm
    },
    {
      name: "Pioneer",
      units: "50-149 units",
      icon: <Rocket className="text-blue-600" size={32} />,
      iconBg: "bg-blue-100",
      features: [
        "All Starter benefits",
        "Volume pricing discounts (30-40% cost savings vs traditional construction)",
        "Dedicated partnership support through complete project lifecycle",
        "Priority production scheduling in factory queue",
        "Access to modular configurator for multi-unit coordination",
        "Housing Accelerator Fund program alignment assistance"
      ],
      buttonVariant: "default" as const,
      buttonText: "Begin Assessment",
      popular: true,
      action: scrollToAssessment
    },
    {
      name: "Preferred",
      units: "150-299 units",
      icon: <Star className="text-primary" size={32} />,
      iconBg: "bg-primary/10",
      features: [
        "All Pioneer benefits",
        "Custom design modifications for municipal code compliance",
        "Enhanced financing coordination and GST rebate processing",
        "Expedited project timeline management (3-month completion capability)",
        "Advanced partnership proposals with ROI analysis",
        "Dedicated account coordination for complex projects"
      ],
      buttonVariant: "outline" as const,
      buttonText: "Begin Assessment",
      action: scrollToAssessment
    },
    {
      name: "Elite", 
      units: "300+ units",
      icon: <Crown className="text-yellow-600" size={32} />,
      iconBg: "bg-yellow-100",
      features: [
        "All Preferred benefits",
        "Exclusive custom community design development",
        "Complete turnkey community solutions (factory to occupancy)",
        "Executive partnership team for strategic projects",
        "Co-development opportunities with ILLÜMMAA design team",
        "Coordinated community delivery within 3-month timeline"
      ],
      buttonVariant: "outline" as const,
      buttonText: "Begin Assessment",
      action: scrollToAssessment
    }
  ];

  return (
    <section id="partnership-tiers" className="py-20 partnership-section" data-testid="section-partnership">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-partnership-title">
            Partnership Tiers for Every Development Scale
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-partnership-subtitle">
            From individual homes to thriving communities, choose the partnership level that matches your development scale and unlock proven modular construction advantages.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" data-testid="container-partnership-tiers">
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
                onClick={tier.action}
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
      
      <ConsumerForm 
        open={showConsumerForm} 
        onOpenChange={setShowConsumerForm}
      />
    </section>
  );
}
