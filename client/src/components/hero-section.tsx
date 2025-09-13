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
    <section className="relative min-h-screen flex items-center" data-testid="section-hero">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80" 
          alt="Modern modular home with pool and contemporary design" 
          className="w-full h-full object-cover object-center"
          style={{opacity: 1.0, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}
          data-testid="img-hero-background"
        />
        <div className="hero-bg absolute inset-0"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          <h1 className="font-display font-bold text-5xl md:text-7xl text-gray-900 mb-6 leading-tight" data-testid="heading-hero-title" style={{color: '#1a365d'}}>
            The Future of Housing Is Here.
          </h1>
          <p className="text-2xl md:text-3xl mb-12 font-medium" data-testid="text-hero-subtitle" style={{color: '#2d3748'}}>
            Your Home, Your Lifestyle
          </p>
          
          {/* Enhanced CTAs */}
          <div className="button-group-mobile" data-testid="container-hero-ctas">
            <Button 
              onClick={scrollToAssessment} 
              size="lg"
              className="btn-primary text-white font-bold text-sm xs:text-base sm:text-xl hero-cta-mobile whitespace-normal leading-tight"
              data-testid="button-qualify-partnership"
            >
              <Handshake className="mr-2 xs:mr-3 flex-shrink-0" size={20} />
              <span>Qualify for Developer Partnership</span>
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="hero-secondary-btn font-semibold text-sm xs:text-base sm:text-xl hero-cta-mobile whitespace-normal leading-tight" 
              data-testid="button-watch-film"
            >
              <Play className="mr-2 xs:mr-3 flex-shrink-0" size={20} style={{color: '#1a365d'}} />
              <span>Watch the Film</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
