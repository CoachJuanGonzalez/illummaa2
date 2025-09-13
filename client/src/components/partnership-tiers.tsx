import { Home, Rocket, Star, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ConsumerForm from "@/components/consumer-form";

export default function PartnershipTiers() {
  const [showConsumerForm, setShowConsumerForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isFormUsed, setIsFormUsed] = useState(false);

  // Security constants
  const CONSUMER_FORM_SESSION_KEY = 'illummaa_partnership_consumer_form_used';

  // Clear session data on page load to reset button state
  useEffect(() => {
    // Clear any existing session data so button resets on page reload
    sessionStorage.removeItem(CONSUMER_FORM_SESSION_KEY);
    
    // Ensure clean state on page load
    setIsFormUsed(false);
    setShowSuccessMessage(false);
  }, []);

  const openConsumerForm = () => {
    if (isFormUsed || showSuccessMessage) {
      return; // Prevent opening if already used or success shown
    }
    setShowConsumerForm(true);
  };

  const handleFormSuccess = () => {
    // Mark as used in sessionStorage (resets on page reload)
    const sessionData = {
      used: true,
      component: 'partnership_consumer_form',
      usedAt: new Date().toISOString()
    };
    sessionStorage.setItem(CONSUMER_FORM_SESSION_KEY, JSON.stringify(sessionData));
    setIsFormUsed(true);
    
    // Close the modal and show inline success message
    setShowConsumerForm(false);
    setShowSuccessMessage(true);
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
      buttonText: isFormUsed || showSuccessMessage ? "Form Submitted" : "Get Started",
      action: openConsumerForm,
      disabled: isFormUsed || showSuccessMessage
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
                className={`w-full ${tier.buttonVariant === 'default' ? 'btn-primary' : ''} ${tier.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={tier.action}
                disabled={tier.disabled}
                data-testid={`button-tier-${tier.name.toLowerCase()}`}
                title={tier.disabled ? "Form already submitted - please reload page for new submission" : tier.buttonText}
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
        
        {/* Inline Success Message */}
        {showSuccessMessage && (
          <div className="mt-12 max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-2xl p-8 shadow-lg" data-testid="success-message-inline">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2" data-testid="heading-success-title">
                Inquiry Submitted Successfully!
              </h3>
              <p className="text-green-700 mb-4" data-testid="text-success-message">
                Thank you for your interest in ILLÜMMAA's residential services. Our team will contact you within 24-48 hours.
              </p>
              <p className="text-sm text-green-600" data-testid="text-success-note">
                Ready for a new inquiry? Simply reload the page.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <ConsumerForm 
        open={showConsumerForm} 
        onOpenChange={setShowConsumerForm}
        onSuccess={handleFormSuccess}
      />
    </section>
  );
}
