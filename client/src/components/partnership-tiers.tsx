import { Home, Rocket, Star, Crown, Check, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ConsumerForm from "@/components/consumer-form";
import { useTranslation } from "react-i18next";

export default function PartnershipTiers() {
  const { t } = useTranslation();
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
      name: t('partnershipTiers.pioneer.name'),
      units: t('partnershipTiers.pioneer.units'),
      icon: <Rocket className="text-blue-600" size={32} />,
      iconBg: "bg-blue-100",
      accentColor: "border-blue-200",
      features: t('partnershipTiers.pioneer.features', { returnObjects: true }) as string[],
      buttonVariant: "outline" as const,
      buttonText: t('partnershipTiers.pioneer.cta'),
      action: scrollToAssessment,
      disabled: false
    },
    {
      name: t('partnershipTiers.preferred.name'),
      units: t('partnershipTiers.preferred.units'),
      icon: <Star className="text-primary" size={32} />,
      iconBg: "bg-primary/10",
      accentColor: "border-primary",
      features: t('partnershipTiers.preferred.features', { returnObjects: true }) as string[],
      buttonVariant: "default" as const,
      buttonText: t('partnershipTiers.preferred.cta'),
      popular: true,
      action: scrollToAssessment,
      disabled: false
    },
    {
      name: t('partnershipTiers.elite.name'),
      units: t('partnershipTiers.elite.units'),
      icon: <Crown className="text-yellow-600" size={32} />,
      iconBg: "bg-yellow-100",
      accentColor: "border-yellow-200",
      features: t('partnershipTiers.elite.features', { returnObjects: true }) as string[],
      buttonVariant: "outline" as const,
      buttonText: t('partnershipTiers.elite.cta'),
      action: scrollToAssessment,
      disabled: false
    }
  ];

  return (
    <section id="partnership-tiers" className="py-20 bg-muted" data-testid="section-partnership">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-partnership-title">
            {t('partnershipTiers.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-partnership-subtitle">
            {t('partnershipTiers.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-6xl mx-auto" data-testid="container-partnership-tiers">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className={`card-hover bg-card rounded-2xl p-8 shadow-xl border-2 relative ${
                tier.popular ? 'border-primary' : tier.accentColor || 'border-transparent'
              }`}
              data-testid={`card-tier-${tier.name.toLowerCase()}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2" data-testid="badge-most-popular">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    {t('partnershipTiers.preferred.badge')}
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
                disabled={tier.disabled ?? false}
                data-testid={`button-tier-${tier.name.toLowerCase()}`}
                title={tier.disabled ? "Form already submitted - please reload page for new submission" : tier.buttonText}
              >
                {tier.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 mb-12">
          <p className="text-sm text-muted-foreground italic" data-testid="text-partnership-disclaimer">
            {t('partnershipTiers.disclaimer')}
          </p>
        </div>
        
        {/* Educational Resources Banner - New to Modular Construction */}
        <div className="mt-12 max-w-6xl mx-auto" data-testid="container-educational-banner">
          <div className="bg-gradient-to-r from-community-neutral/30 to-community-primary/10 rounded-2xl shadow-md border border-gray-200 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
              {/* Left Side - Main Content (60%) */}
              <div className="md:col-span-3">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-white rounded-full p-3 shadow-sm flex-shrink-0">
                    <BookOpen className="text-community-primary" size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {t('partnershipTiers.educationalBanner.title')}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {t('partnershipTiers.educationalBanner.description')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="mt-4 border-community-primary text-community-primary hover:bg-community-primary hover:text-white transition-all"
                  data-testid="button-explore-modular-resources"
                  onClick={(e) => {
                    e.preventDefault();
                    // Use anchor tag click - most reliable method across all browsers
                    const mailtoLink = document.createElement('a');
                    mailtoLink.href = 'mailto:info@illummaa.com';
                    mailtoLink.style.display = 'none';
                    document.body.appendChild(mailtoLink);
                    mailtoLink.click();
                    document.body.removeChild(mailtoLink);
                  }}
                >
                  {t('partnershipTiers.educationalBanner.cta')}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>

              {/* Right Side - Quick Links (40%) */}
              <div className="md:col-span-2">
                <ul className="space-y-3">
                  {(t('partnershipTiers.educationalBanner.quickLinks', { returnObjects: true }) as string[]).map((link, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <Check className="text-community-primary flex-shrink-0" size={20} />
                      <span>{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 px-4">
          <Button
            onClick={scrollToAssessment}
            size="lg"
            className="btn-primary text-white font-semibold text-sm xs:text-base sm:text-lg w-full max-w-xs xs:max-w-sm sm:max-w-md mx-auto rounded-2xl hero-cta-mobile whitespace-normal leading-tight"
            data-testid="button-apply-partnership"
          >
            {t('partnershipTiers.mainCta')}
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
                Thank you for your interest in ILLUMMAA's residential services. Our team will contact you within 24-48 hours.
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
