import { Handshake, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import heroDesktopImage from "../assets/hero-desktop.png";
import heroMobileImage from "../assets/hero-mobile.png";

export default function HeroSection() {
  // Preload critical hero images for faster initial paint
  useEffect(() => {
    const link1 = document.createElement('link');
    link1.rel = 'preload';
    link1.as = 'image';
    link1.href = heroMobileImage;
    link1.media = '(max-width: 767px)';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'preload';
    link2.as = 'image';
    link2.href = heroDesktopImage;
    link2.media = '(min-width: 768px)';
    document.head.appendChild(link2);

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
    };
  }, []);

  const scrollToAssessment = () => {
    const element = document.getElementById("developer-qualification");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToModels = () => {
    const element = document.getElementById("models");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative hero-layout-proportions hero-cross-device-beauty" data-testid="section-hero">
      {/* Responsive Background Images with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Desktop Image - Hidden on Mobile */}
        <img
          src={heroDesktopImage}
          alt="Canadian modular housing partnership opportunities with proven development success"
          className="hidden md:block w-full h-full object-cover hero-enterprise-layout hero-retina-quality hero-fluid-transitions"
          loading="eager"
          style={{
            opacity: 1.0,
            filter: 'brightness(1.1) contrast(1.2) saturate(1.05)'
          }}
          data-testid="img-hero-background-desktop"
        />
        {/* Mobile Image - Hidden on Desktop */}
        <img
          src={heroMobileImage}
          alt="Canadian modular housing partnership opportunities with proven development success"
          className="block md:hidden w-full h-full object-cover hero-enterprise-layout hero-retina-quality hero-fluid-transitions"
          loading="eager"
          style={{
            opacity: 1.0,
            filter: 'brightness(1.1) contrast(1.2) saturate(1.05)'
          }}
          data-testid="img-hero-background-mobile"
        />
        {/* Text overlay protection with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        <div className="hero-bg absolute inset-0"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="hero-content-width hero-content-spacing">
          <div>
            <h1
              className="font-display hero-title-typography hero-title-responsive hero-title-enhanced hero-text-spacing text-gray-900 mb-4"
              data-testid="heading-hero-title"
              style={{color: '#1a1a1a', fontWeight: 800}}
            >
              Building Homes, Strengthening Communities
            </h1>
            <p
              className="hero-subtitle-typography hero-subtitle-responsive hero-subtitle-enhanced hero-subtitle-spacing mb-8"
              data-testid="text-hero-subtitle"
              style={{color: '#2d3748', fontWeight: 500}}
            >
              Your Partner in Community-First Housing Solutions
            </p>
          </div>

          {/* Enhanced CTAs with improved hierarchy */}
          <div className="button-group-hero-optimized mt-12" data-testid="container-hero-ctas">
            <Button
              onClick={scrollToAssessment}
              size="lg"
              className="btn-primary-hero text-white hero-cta-primary shadow-lg"
              data-testid="button-qualify-partnership"
            >
              <Handshake className="flex-shrink-0" size={18} />
              <span>Join Our Housing Community</span>
            </Button>
            <Button
              onClick={scrollToModels}
              variant="outline"
              size="lg"
              className="hero-secondary-btn-optimized hero-cta-secondary"
              data-testid="button-view-models"
            >
              <Home className="flex-shrink-0" size={18} style={{color: '#1a365d'}} />
              <span>View Our Models</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
