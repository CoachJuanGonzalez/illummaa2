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
              <svg viewBox="0 0 400 120" className="h-6 w-auto text-[#2C5530]" aria-label="ü ILLÜMMAA logo" data-testid="logo-svg">
                <title>ü ILLÜMMAA Logo</title>
                <g fill="currentColor">
                  <g data-testid="logo-text">
                    <circle cx="24" cy="24" r="4"/>
                    <circle cx="44" cy="24" r="4"/>
                    <path d="M16 44 L16 84 Q16 96 28 96 L40 96 Q52 96 52 84 L52 44 L44 44 L44 84 Q44 88 40 88 L28 88 Q24 88 24 84 L24 44 Z"/>
                  </g>
                  <path d="M80 44 L80 96 L88 96 L88 44 Z"/>
                  <path d="M104 44 L104 96 L132 96 L132 88 L112 88 L112 44 Z"/>
                  <path d="M148 44 L148 96 L176 96 L176 88 L156 88 L156 44 Z"/>
                  <g>
                    <circle cx="196" cy="24" r="4"/>
                    <circle cx="216" cy="24" r="4"/>
                    <path d="M188 44 L188 84 Q188 96 200 96 L212 96 Q224 96 224 84 L224 44 L216 44 L216 84 Q216 88 212 88 L200 88 Q196 88 196 84 L196 44 Z"/>
                  </g>
                  <path d="M240 44 L240 96 L248 96 L248 64 L254 84 L258 84 L264 64 L264 96 L272 96 L272 44 L260 44 L256 72 L252 44 Z"/>
                  <path d="M288 44 L288 96 L296 96 L296 64 L302 84 L306 84 L312 64 L312 96 L320 96 L320 44 L308 44 L304 72 L300 44 Z"/>
                  <path d="M336 96 L328 96 L330 88 L342 88 L344 96 L352 96 L342 44 L330 44 Z M332 76 L340 76 L336 60 Z"/>
                  <path d="M368 96 L360 96 L362 88 L374 88 L376 96 L384 96 L374 44 L362 44 Z M364 76 L372 76 L368 60 Z"/>
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
