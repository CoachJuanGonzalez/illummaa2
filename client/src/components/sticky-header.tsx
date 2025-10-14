import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trackHeaderNavClick, analytics } from "../lib/analytics";
import logoUrl from "@assets/logo-logotype_1758569347527.png";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./language-switcher";

export default function StickyHeader() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile browsers and apply appropriate positioning
  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    detectMobile();
    window.addEventListener('resize', detectMobile);
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  const scrollToSection = (id: string, sectionName?: string) => {
    // Track navigation click
    trackHeaderNavClick(sectionName || id, id);

    // Close mobile menu first
    setMobileMenuOpen(false);

    // Check if we're on the home page (supports both /en and /fr)
    const isHomePage = location === "/" || location === "" || location === "/en" || location === "/en/" || location === "/fr" || location === "/fr/";

    if (!isHomePage) {
      // If not on home page, navigate to home first, then scroll
      navigate("/");

      // Wait for navigation to complete, then scroll to section
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          // Get the actual sticky bar height
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 80;

          // Add extra offset for mobile devices
          const isMobile = window.innerWidth < 768;
          const extraOffset = isMobile ? 24 : 10;

          // Calculate the target scroll position
          const elementRect = element.getBoundingClientRect();
          const targetPosition = elementRect.top + window.scrollY - headerHeight - extraOffset;

          // Scroll to the calculated position
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth"
          });
        }
      }, 100); // Small delay to ensure DOM is updated after navigation
    } else {
      // Already on home page, just scroll to section
      const element = document.getElementById(id);
      if (element) {
        // Wait a frame for menu to close, then calculate scroll position
        requestAnimationFrame(() => {
          // Get the actual sticky bar height
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 80;

          // Add extra offset for mobile devices
          const isMobile = window.innerWidth < 768;
          const extraOffset = isMobile ? 24 : 10;

          // Calculate the target scroll position
          const elementRect = element.getBoundingClientRect();
          const targetPosition = elementRect.top + window.scrollY - headerHeight - extraOffset;

          // Scroll to the calculated position
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth"
          });
        });
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    // Close mobile menu first
    setMobileMenuOpen(false);

    // Check if we're on the home page (supports both /en and /fr)
    const isHomePage = location === "/" || location === "" || location === "/en" || location === "/en/" || location === "/fr" || location === "/fr/";

    // Track logo click
    analytics.trackNavigation({
      action: 'logo_click',
      category: 'Navigation',
      section_name: 'Logo',
      navigation_type: 'header',
      label: 'ILLUMMAA Logo',
      custom_parameters: {
        current_location: location,
        action_type: isHomePage ? 'scroll_to_top' : 'navigate_home'
      }
    });

    // If already on home page, scroll to top instead of navigating
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Navigate to home page
      navigate("/");
    }
  };

  return (
    <header 
      className={`${isMobile ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-50 bg-white md:bg-white/95 md:backdrop-blur-sm border-b border-border`}
      data-testid="header-main"
      style={{
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: 'translateZ(0)', // Hardware acceleration
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      <nav className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="cursor-pointer" data-testid="logo-link" onClick={handleLogoClick}>
            <div className="px-3 py-2 md:px-0 md:py-0 hover:opacity-80 hover:scale-105 transition-all duration-200" data-testid="logo-container">
              <div 
                className="h-9 md:h-10 lg:h-12 w-[120px] md:w-[133px] lg:w-[160px] flex items-center"
                data-testid="logo-wrapper"
              >
                <img 
                  src={logoUrl} 
                  alt="ü ILLUMMAA logo" 
                  data-testid="logo-image" 
                  className="h-[18px] md:h-[20px] lg:h-[24px] w-auto" 
                  style={{
                    transform: 'scale(1)',
                    transformOrigin: 'left center',
                    imageRendering: 'auto'
                  }}
                />
              </div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8" data-testid="nav-desktop">
            <button
              onClick={() => scrollToSection("developer-qualification", t('navigation.partnershipApplication'))}
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-partnership-application"
            >
              {t('navigation.partnershipApplication')}
            </button>
            <button
              onClick={() => scrollToSection("why", t('navigation.why'))}
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-why"
            >
              {t('navigation.why')}
            </button>
            <button
              onClick={() => scrollToSection("leadership", t('navigation.leadership'))}
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-leadership"
            >
              {t('navigation.leadership')}
            </button>
            <button
              onClick={() => scrollToSection("models", t('navigation.models'))}
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-models"
            >
              {t('navigation.models')}
            </button>
            <button
              onClick={() => scrollToSection("developer-qualification", t('navigation.developers'))}
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-developers"
            >
              {t('navigation.developers')}
            </button>
            <button
              onClick={() => scrollToSection("partnership-tiers", t('navigation.partnership'))}
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-partnership"
            >
              {t('navigation.partnership')}
            </button>
            <button
              onClick={() => scrollToSection("contact", t('navigation.contact'))}
              className="text-foreground hover:text-primary transition-colors min-h-[44px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              data-testid="nav-contact"
            >
              {t('navigation.contact')}
            </button>
            <LanguageSwitcher />
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
            aria-label={mobileMenuOpen ? t('navigation.menuClose') : t('navigation.menuOpen')}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border" data-testid="nav-mobile">
            <div className="flex flex-col space-y-2 pt-4">
              <button
                onClick={() => scrollToSection("developer-qualification", t('navigation.partnershipApplication'))}
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-partnership-application"
              >
                {t('navigation.partnershipApplication')}
              </button>
              <button
                onClick={() => scrollToSection("why", t('navigation.why'))}
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-why"
              >
                {t('navigation.why')}
              </button>
              <button
                onClick={() => scrollToSection("leadership", t('navigation.leadership'))}
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-leadership"
              >
                {t('navigation.leadership')}
              </button>
              <button
                onClick={() => scrollToSection("models", t('navigation.models'))}
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-models"
              >
                {t('navigation.models')}
              </button>
              <button
                onClick={() => scrollToSection("developer-qualification", t('navigation.developers'))}
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-developers"
              >
                {t('navigation.developers')}
              </button>
              <button
                onClick={() => scrollToSection("partnership-tiers", t('navigation.partnership'))}
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-partnership"
              >
                {t('navigation.partnership')}
              </button>
              <button
                onClick={() => scrollToSection("contact", t('navigation.contact'))}
                className="nav-button-mobile text-left text-foreground hover:text-primary transition-colors rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                data-testid="nav-mobile-contact"
              >
                {t('navigation.contact')}
              </button>
              <div className="px-4 py-3 border-t border-border mt-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
