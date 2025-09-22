import { Linkedin, Twitter, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { trackFooterNavClick, analytics } from "../lib/analytics";

export default function Footer() {
  const scrollToSection = (id: string, sectionName?: string) => {
    // Track footer navigation click
    trackFooterNavClick(sectionName || id, id);
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const trackSocialClick = (platform: string) => {
    analytics.trackNavigation({
      action: 'social_link_click',
      category: 'Social Media',
      section_name: platform,
      navigation_type: 'footer',
      label: `${platform} Link`,
      custom_parameters: {
        platform: platform,
        location: 'footer',
        link_type: 'external'
      }
    });
  };

  return (
    <footer id="contact" className="bg-foreground text-background py-16" data-testid="footer-main">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2" data-testid="section-company-info">
            <div className="mb-6" data-testid="footer-logo">
              <svg viewBox="0 0 400 120" className="h-6 w-auto text-white" aria-label="ü ILLÜMMAA logo">
                <title>ü ILLÜMMAA Logo</title>
                <g fill="currentColor">
                  <g data-testid="footer-company-name">
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
            <p className="text-white/80 text-lg mb-6 max-w-md" data-testid="footer-company-description">
              Industrial modular homes for Canada's housing future. Building faster, smarter, and more sustainably.
            </p>
            <div className="flex space-x-4" data-testid="social-links">
              <a href="#" onClick={() => trackSocialClick('LinkedIn')} className="min-w-[44px] min-h-[44px] bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-foreground" data-testid="link-linkedin" aria-label="LinkedIn">
                <Linkedin className="text-white" size={20} />
              </a>
              <a href="#" onClick={() => trackSocialClick('Twitter')} className="min-w-[44px] min-h-[44px] bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-foreground" data-testid="link-twitter" aria-label="Twitter">
                <Twitter className="text-white" size={20} />
              </a>
              <a href="#" onClick={() => trackSocialClick('Instagram')} className="min-w-[44px] min-h-[44px] bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-foreground" data-testid="link-instagram" aria-label="Instagram">
                <Instagram className="text-white" size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div data-testid="section-quick-links">
            <h3 className="font-semibold text-white text-lg mb-6" data-testid="heading-quick-links">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection("developer-qualification", "Assessment")} 
                  className="text-white/80 hover:text-white transition-colors text-left min-h-[44px] py-2 px-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-foreground"
                  data-testid="link-footer-assessment"
                >
                  Assessment
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("why", "Why ILLÜMMAA")} 
                  className="text-white/80 hover:text-white transition-colors text-left min-h-[44px] py-2 px-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-foreground"
                  data-testid="link-footer-why"
                >
                  Why ILLÜMMAA
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("models", "Models")} 
                  className="text-white/80 hover:text-white transition-colors text-left min-h-[44px] py-2 px-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-foreground"
                  data-testid="link-footer-models"
                >
                  Models
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("partnership-tiers", "Partnership")} 
                  className="text-white/80 hover:text-white transition-colors text-left min-h-[44px] py-2 px-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-foreground"
                  data-testid="link-footer-partnership"
                >
                  Partnership
                </button>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div data-testid="section-contact-info">
            <h3 className="font-semibold text-white text-lg mb-6" data-testid="heading-contact">Contact</h3>
            <ul className="space-y-3">
              <li className="text-white/80 flex items-center" data-testid="contact-phone">
                <Phone className="mr-2" size={16} />
                +1 (800) ILLUMMAA
              </li>
              <li className="text-white/80 flex items-center" data-testid="contact-email">
                <Mail className="mr-2" size={16} />
                <a href="mailto:info@illummaa.com" className="hover:text-white transition-colors">
                  info@illummaa.com
                </a>
              </li>
              <li className="text-white/80 flex items-center" data-testid="contact-location">
                <MapPin className="mr-2" size={16} />
                <a 
                  href="https://maps.google.com/?q=17550+2nd+Floor+Trans-Canada+Hwy,+Kirkland,+Quebec,+H9J+3A3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  17550 2nd Floor Trans-Canada Hwy, Kirkland, Quebec, H9J 3A3
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 text-center" data-testid="footer-bottom">
          <p className="text-white/60" data-testid="copyright">
            &copy; 2024 ILLÜMMAA. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}
