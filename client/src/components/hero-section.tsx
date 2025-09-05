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
          className="w-full h-full object-cover"
          data-testid="img-hero-background"
        />
        <div className="hero-bg absolute inset-0"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          <h1 className="font-display font-bold text-5xl md:text-7xl text-white mb-6 leading-tight" data-testid="heading-hero-title">
            The Future of Housing Is Here.
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-8 font-medium" data-testid="text-hero-subtitle">
            Light Living. Elevated.
          </p>
          
          {/* Authority Badges */}
          <div className="flex flex-wrap gap-4 mb-10" data-testid="container-authority-badges">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20" data-testid="badge-csa-certified">
              <span className="text-white font-medium">
                <Award className="inline mr-2" size={16} />
                CSA Certified
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20" data-testid="badge-government-approved">
              <span className="text-white font-medium">
                <CheckCircle className="inline mr-2" size={16} />
                Government Approved
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20" data-testid="badge-units-delivered">
              <span className="text-white font-medium">
                <Trophy className="inline mr-2" size={16} />
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
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-2xl text-white font-semibold text-lg hover:bg-white/20 transition-all flex items-center justify-center" data-testid="button-watch-film">
              <Play className="mr-3" size={20} />
              Watch the Film
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
