import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trackHeaderNavClick, analytics } from "../lib/analytics";
// Logo now using inline SVG for maximum quality and scaling

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
      <nav className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="cursor-pointer" data-testid="logo-link" onClick={handleLogoClick}>
            <div className="hover:opacity-80 hover:scale-105 transition-all duration-200" data-testid="logo-container">
              <div 
                className="h-9 md:h-10 lg:h-12 w-[120px] md:w-[133px] lg:w-[160px] flex items-center"
                data-testid="logo-wrapper"
              >
                <svg 
                  viewBox="0 0 200 60" 
                  className="h-[18px] md:h-[20px] lg:h-[24px] w-auto"
                  style={{
                    transform: 'scale(2)',
                    transformOrigin: 'left center'
                  }}
                  preserveAspectRatio="xMinYMid meet"
                  role="img"
                  aria-label="ü ILLUMMAA logo"
                  data-testid="logo-svg"
                >
                  <g fill="currentColor">
                    {/* ü character standalone */}
                    <g>
                      {/* dots above u */}
                      <circle cx="12" cy="12" r="2"/>
                      <circle cx="22" cy="12" r="2"/>
                      {/* u letter path */}
                      <path d="M8 22 L8 42 Q8 48 14 48 L20 48 Q26 48 26 42 L26 22 L22 22 L22 42 Q22 44 20 44 L14 44 Q12 44 12 42 L12 22 Z"/>
                    </g>
                    
                    {/* I */}
                    <path d="M40 22 L40 48 L44 48 L44 22 Z"/>
                    
                    {/* L */}
                    <path d="M52 22 L52 48 L66 48 L66 44 L56 44 L56 22 Z"/>
                    
                    {/* L */}
                    <path d="M74 22 L74 48 L88 48 L88 44 L78 44 L78 22 Z"/>
                    
                    {/* Ü */}
                    <g>
                      {/* dots above U */}
                      <circle cx="98" cy="12" r="2"/>
                      <circle cx="108" cy="12" r="2"/>
                      {/* U letter path */}
                      <path d="M94 22 L94 42 Q94 48 100 48 L106 48 Q112 48 112 42 L112 22 L108 22 L108 42 Q108 44 106 44 L100 44 Q98 44 98 42 L98 22 Z"/>
                    </g>
                    
                    {/* M */}
                    <path d="M120 22 L120 48 L124 48 L124 32 L127 42 L129 42 L132 32 L132 48 L136 48 L136 22 L130 22 L128 36 L126 22 Z"/>
                    
                    {/* M */}
                    <path d="M144 22 L144 48 L148 48 L148 32 L151 42 L153 42 L156 32 L156 48 L160 48 L160 22 L154 22 L152 36 L150 22 Z"/>
                    
                    {/* A */}
                    <path d="M168 48 L164 48 L165 44 L171 44 L172 48 L176 48 L171 22 L165 22 Z M166 38 L170 38 L168 30 Z"/>
                    
                    {/* A */}
                    <path d="M184 48 L180 48 L181 44 L187 44 L188 48 L192 48 L187 22 L181 22 Z M182 38 L186 38 L184 30 Z"/>
                  </g>
                </svg>
              </div>
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
