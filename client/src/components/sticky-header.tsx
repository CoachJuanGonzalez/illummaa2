import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trackHeaderNavClick, analytics } from "../lib/analytics";

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
      label: 'ILLÜMMAA Logo',
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
              <svg viewBox="0 0 240 48" aria-label="ILLÜMMAA logo" data-testid="logo-svg" className="h-6 w-auto text-[#2C5530]">
                <title>ILLÜMMAA Logo</title>
                <g fill="currentColor">
                  <rect x="12" y="12" width="6" height="24" rx="1" data-testid="logo-text"/>
                  <rect x="26" y="12" width="6" height="24" rx="1"/>
                  <rect x="26" y="30" width="16" height="6" rx="1"/>
                  <rect x="50" y="12" width="6" height="24" rx="1"/>
                  <rect x="50" y="30" width="16" height="6" rx="1"/>
                  <circle cx="76" cy="6" r="2"/>
                  <circle cx="84" cy="6" r="2"/>
                  <rect x="74" y="12" width="6" height="18" rx="1"/>
                  <rect x="84" y="12" width="6" height="18" rx="1"/>
                  <rect x="74" y="30" width="16" height="6" rx="3"/>
                  <rect x="98" y="12" width="6" height="24" rx="1"/>
                  <rect x="118" y="12" width="6" height="24" rx="1"/>
                  <polygon points="104,12 111,26 118,12 116,12 111,22 106,12"/>
                  <rect x="132" y="12" width="6" height="24" rx="1"/>
                  <rect x="152" y="12" width="6" height="24" rx="1"/>
                  <polygon points="138,12 145,26 152,12 150,12 145,22 140,12"/>
                  <polygon points="166,36 172,12 178,12 184,36 178,36 177,30 173,30 172,36"/>
                  <rect x="174" y="24" width="6" height="4" rx="1"/>
                  <polygon points="192,36 198,12 204,12 210,36 204,36 203,30 199,30 198,36"/>
                  <rect x="200" y="24" width="6" height="4" rx="1"/>
                </g>
              </svg>
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
