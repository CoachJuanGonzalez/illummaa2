import { Handshake, Play, Award, CheckCircle, Trophy } from "lucide-react";

export default function HeroSection() {
  const scrollToAssessment = () => {
    const element = document.getElementById("assessment");
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
          className="w-full h-full object-cover brightness-110"
          data-testid="img-hero-background"
        />
        <div className="hero-bg absolute inset-0"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          <h1 className="font-display font-bold text-5xl md:text-7xl text-gray-900 mb-6 leading-tight" data-testid="heading-hero-title" style={{color: '#1a365d'}}>
            The Future of Housing Is Here.
          </h1>
          <p className="text-2xl md:text-3xl mb-8 font-medium" data-testid="text-hero-subtitle" style={{color: '#2d3748'}}>
            Light Living. Elevated.
          </p>
          
          {/* Authority Badges */}
          <div className="flex flex-wrap gap-4 mb-10" data-testid="container-authority-badges">
            <div className="hero-badge rounded-2xl px-6 py-3" data-testid="badge-csa-certified">
              <span className="font-medium">
                <Award className="inline mr-2" size={16} style={{color: '#1a365d'}} />
                CSA Certified
              </span>
            </div>
            <div className="hero-badge rounded-2xl px-6 py-3" data-testid="badge-government-approved">
              <span className="font-medium">
                <CheckCircle className="inline mr-2" size={16} style={{color: '#1a365d'}} />
                Government Approved
              </span>
            </div>
            <div className="hero-badge rounded-2xl px-6 py-3" data-testid="badge-units-delivered">
              <span className="font-medium">
                <Trophy className="inline mr-2" size={16} style={{color: '#1a365d'}} />
                500+ Units Delivered
              </span>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4" data-testid="container-hero-ctas">
            <button 
              onClick={scrollToAssessment} 
              className="btn-primary px-8 py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center"
              data-testid="button-qualify-partnership"
            >
              <Handshake className="mr-3" size={20} />
              Qualify for Developer Partnership
            </button>
            <button className="hero-secondary-btn px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center" data-testid="button-watch-film">
              <Play className="mr-3" size={20} style={{color: '#1a365d'}} />
              Watch the Film
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
