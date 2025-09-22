import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trackHeaderNavClick, analytics } from "../lib/analytics";
import logoUrl from "@assets/Latest ILLUMMAA_1758506338570.png";

export default function StickyHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();

  const scrollToSection = (id: string, sectionName?: string) => {
    // Track navigation click
    trackHeaderNavClick(sectionName || id, id);
    
    const element = document.getElementById(id);
    if (element) {
      // Close mobile menu first to get accurate header height
      setMobileMenuOpen(false);
      
      // Wait a frame for menu to close, then calculate scroll position
      requestAnimationFrame(() => {
        // Get the actual sticky bar height (not including expanded menu)
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 80; // Fallback to 80px
        
        // Add extra offset for mobile devices to ensure proper positioning
        const isMobile = window.innerWidth < 768; // md breakpoint
        const extraOffset = isMobile ? 24 : 10; // Slightly larger offset for mobile
        
        // Calculate the target scroll position using getBoundingClientRect for accuracy
        const elementRect = element.getBoundingClientRect();
        const targetPosition = elementRect.top + window.scrollY - headerHeight - extraOffset;
        
        // Scroll to the calculated position
        window.scrollTo({
          top: Math.max(0, targetPosition), // Ensure we don't scroll past the top
          behavior: "smooth"
        });
      });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    // Track logo click
    analytics.trackNavigation({
      action: 'logo_click',
      category: 'Navigation',
      section_name: 'Logo',
      navigation_type: 'header',
      label: 'ILLUMMAA Logo',
      custom_parameters: {
        current_location: location,
        action_type: location === "/" || location === "" ? 'scroll_to_top' : 'navigate_home'
      }
    });
    
    // If already on home page, scroll to top instead of navigating
    if (location === "/" || location === "") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Navigate to home page
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border" data-testid="header-main">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="cursor-pointer" data-testid="logo-link" onClick={handleLogoClick}>
            <div className="hover:opacity-80 hover:scale-105 transition-all duration-200" data-testid="logo-container">
              <img 
                src={logoUrl} 
                alt="ü ILLUMMAA logo" 
                data-testid="logo-image" 
                className="h-40 w-auto" 
                style={{
                  imageRendering: 'auto'
                }}
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" data-testid="nav-desktop">
            <button 
              onClick={() => scrollToSection("developer-qualification", "Assessment")} 
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-assessment"
            >
              Assessment
            </button>
            <button 
              onClick={() => scrollToSection("why", "Why")} 
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-why"
            >
              Why
            </button>
            <button 
              onClick={() => scrollToSection("leadership", "Leadership")} 
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-leadership"
            >
              Leadership
            </button>
            <button 
              onClick={() => scrollToSection("models", "Models")} 
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-models"
            >
              Models
            </button>
            <button 
              onClick={() => scrollToSection("developer-qualification", "Developers")} 
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-developers"
            >
              Developers
            </button>
            <button 
              onClick={() => scrollToSection("partnership-tiers", "Partnership")} 
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-partnership"
            >
              Partnership
            </button>
            <button 
              onClick={() => scrollToSection("contact", "Contact")} 
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-contact"
            >
              Contact
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border" data-testid="nav-mobile">
            <div className="flex flex-col space-y-2 pt-4">
              <button 
                onClick={() => scrollToSection("developer-qualification", "Assessment")} 
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-assessment"
              >
                Assessment
              </button>
              <button 
                onClick={() => scrollToSection("why", "Why")} 
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-why"
              >
                Why
              </button>
              <button 
                onClick={() => scrollToSection("leadership", "Leadership")} 
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-leadership"
              >
                Leadership
              </button>
              <button 
                onClick={() => scrollToSection("models", "Models")} 
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-models"
              >
                Models
              </button>
              <button 
                onClick={() => scrollToSection("developer-qualification", "Developers")} 
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-developers"
              >
                Developers
              </button>
              <button 
                onClick={() => scrollToSection("partnership-tiers", "Partnership")} 
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-partnership"
              >
                Partnership
              </button>
              <button 
                onClick={() => scrollToSection("contact", "Contact")} 
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
