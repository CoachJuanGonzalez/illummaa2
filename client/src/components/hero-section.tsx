import { Handshake, Play } from "lucide-react";

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
          <div className="flex flex-col sm:flex-row gap-6 justify-center sm:justify-start" data-testid="container-hero-ctas">
            <button 
              onClick={scrollToAssessment} 
              className="btn-primary px-10 py-5 rounded-2xl text-white font-bold text-xl flex items-center justify-center transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              data-testid="button-qualify-partnership"
            >
              <Handshake className="mr-3" size={24} />
              Qualify for Developer Partnership
            </button>
            <button className="hero-secondary-btn px-10 py-5 rounded-2xl font-semibold text-xl transition-all duration-200 flex items-center justify-center hover:bg-white hover:shadow-lg" data-testid="button-watch-film">
              <Play className="mr-3" size={24} style={{color: '#1a365d'}} />
              Watch the Film
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
