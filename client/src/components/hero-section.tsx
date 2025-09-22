import { Handshake, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBackgroundImage from "@assets/Generated Image September 14, 2025 - 12_11PM_1757866782266.png";

export default function HeroSection() {
  const scrollToAssessment = () => {
    const element = document.getElementById("developer-qualification");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative hero-layout-proportions hero-cross-device-beauty" data-testid="section-hero">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBackgroundImage} 
          alt="Aerial view of modern modular home community with solar panels and sustainable green spaces" 
          className="w-full h-full object-cover hero-enterprise-layout hero-retina-quality hero-fluid-transitions"
          style={{
            opacity: 1.0,
            filter: 'brightness(1.1) contrast(1.2) saturate(1.05)'
          }}
          data-testid="img-hero-background"
        />
        {/* Text overlay protection with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        <div className="hero-bg absolute inset-0"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="hero-content-width hero-content-spacing">
          <div className="hero-text-overlay md:bg-transparent md:backdrop-filter-none">
            {/* Semi-transparent background for text readability */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg md:bg-transparent md:backdrop-blur-none"></div>
            <div className="relative z-10">
              <h1 className="font-display hero-title-typography hero-title-responsive hero-title-enhanced hero-text-spacing text-gray-900 mb-4" data-testid="heading-hero-title" style={{color: '#000000', textShadow: '2px 2px 6px rgba(255,255,255,0.8), 1px 1px 3px rgba(0,0,0,0.3)'}}>
                The Future of Housing Is Here.
              </h1>
              <p className="hero-subtitle-typography hero-subtitle-responsive hero-subtitle-enhanced hero-subtitle-spacing mb-8" data-testid="text-hero-subtitle" style={{color: '#000000', textShadow: '2px 2px 4px rgba(255,255,255,0.8), 1px 1px 2px rgba(0,0,0,0.25)', fontSize: '120%'}}>
                Your Home, Your Lifestyle
              </p>
            </div>
          </div>
          
          {/* Enhanced CTAs with improved hierarchy */}
          <div className="button-group-hero-optimized mt-12" data-testid="container-hero-ctas">
            <Button 
              onClick={scrollToAssessment} 
              size="lg"
              className="btn-primary-hero text-white hero-cta-primary shadow-lg"
              data-testid="button-qualify-partnership"
            >
              <Handshake className="mr-3 flex-shrink-0" size={20} />
              <span>Take Partnership & Learning Assessment</span>
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="hero-secondary-btn-optimized hero-cta-secondary" 
              data-testid="button-watch-film"
            >
              <Play className="mr-2 flex-shrink-0" size={18} style={{color: '#1a365d'}} />
              <span>Watch the Film</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
