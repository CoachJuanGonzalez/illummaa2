import { Handshake, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80" 
          alt="Modern modular home with pool and contemporary design" 
          className="w-full h-full object-cover hero-enterprise-layout hero-retina-quality hero-fluid-transitions"
          style={{opacity: 1.0}}
          data-testid="img-hero-background"
        />
        <div className="hero-bg absolute inset-0"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="hero-content-width hero-content-spacing">
          <div className="hero-text-overlay md:bg-transparent md:backdrop-filter-none">
            <h1 className="font-display hero-title-typography hero-title-responsive hero-title-enhanced hero-text-spacing text-gray-900 mb-4" data-testid="heading-hero-title" style={{color: '#1a365d'}}>
              The Future of Housing Is Here.
            </h1>
            <p className="hero-subtitle-typography hero-subtitle-responsive hero-subtitle-enhanced hero-subtitle-spacing mb-8" data-testid="text-hero-subtitle" style={{color: '#2d3748'}}>
              Your Home, Your Lifestyle
            </p>
          </div>
          
          {/* Enhanced CTAs with improved hierarchy */}
          <div className="button-group-hero-optimized mt-12" data-testid="container-hero-ctas">
            <Button 
              onClick={scrollToAssessment} 
              size="lg"
              className="btn-primary-hero text-white font-bold text-base md:text-lg hero-cta-primary shadow-lg"
              data-testid="button-qualify-partnership"
            >
              <Handshake className="mr-3 flex-shrink-0" size={20} />
              <span>Qualify for Developer Partnership</span>
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="hero-secondary-btn-optimized font-medium text-sm md:text-base hero-cta-secondary" 
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
