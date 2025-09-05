import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function StickyHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border" data-testid="header-main">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3" data-testid="logo-container">
            <div className="w-8 h-8">
              <svg width="32" height="32" viewBox="0 0 64 64" aria-label="ILLÜMMAA emblem" data-testid="logo-svg">
                <circle cx="22" cy="10" r="3" fill="#2C5530"/>
                <circle cx="42" cy="10" r="3" fill="#2C5530"/>
                <path d="M16 16v16c0 12 8 20 16 20s16-8 16-20V16" fill="none" stroke="#2C5530" strokeWidth="6" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="logo-text text-2xl text-primary font-bold" data-testid="logo-text">ILLÜMMAA</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" data-testid="nav-desktop">
            <button 
              onClick={() => scrollToSection("developer-qualification")} 
              className="text-foreground hover:text-primary transition-colors"
              data-testid="nav-assessment"
            >
              Assessment
            </button>
            <button 
              onClick={() => scrollToSection("why")} 
              className="text-foreground hover:text-primary transition-colors"
              data-testid="nav-why"
            >
              Why
            </button>
            <button 
              onClick={() => scrollToSection("models")} 
              className="text-foreground hover:text-primary transition-colors"
              data-testid="nav-models"
            >
              Models
            </button>
            <button 
              onClick={() => scrollToSection("developer-qualification")} 
              className="text-foreground hover:text-primary transition-colors"
              data-testid="nav-developers"
            >
              Developers
            </button>
            <button 
              onClick={() => scrollToSection("partnership-tiers")} 
              className="text-foreground hover:text-primary transition-colors"
              data-testid="nav-partnership"
            >
              Partnership
            </button>
            <button 
              onClick={() => scrollToSection("contact")} 
              className="text-foreground hover:text-primary transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border" data-testid="nav-mobile">
            <div className="flex flex-col space-y-4 pt-4">
              <button 
                onClick={() => scrollToSection("developer-qualification")} 
                className="text-left text-foreground hover:text-primary transition-colors"
                data-testid="nav-mobile-assessment"
              >
                Assessment
              </button>
              <button 
                onClick={() => scrollToSection("why")} 
                className="text-left text-foreground hover:text-primary transition-colors"
                data-testid="nav-mobile-why"
              >
                Why
              </button>
              <button 
                onClick={() => scrollToSection("models")} 
                className="text-left text-foreground hover:text-primary transition-colors"
                data-testid="nav-mobile-models"
              >
                Models
              </button>
              <button 
                onClick={() => scrollToSection("developer-qualification")} 
                className="text-left text-foreground hover:text-primary transition-colors"
                data-testid="nav-mobile-developers"
              >
                Developers
              </button>
              <button 
                onClick={() => scrollToSection("partnership-tiers")} 
                className="text-left text-foreground hover:text-primary transition-colors"
                data-testid="nav-mobile-partnership"
              >
                Partnership
              </button>
              <button 
                onClick={() => scrollToSection("contact")} 
                className="text-left text-foreground hover:text-primary transition-colors"
                data-testid="nav-mobile-contact"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
