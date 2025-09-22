import { Linkedin, Twitter, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { trackFooterNavClick, analytics } from "../lib/analytics";
import logoUrl from "@assets/Latest ILLUMMAA_1758506338570.png";

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
              <img 
                src={logoUrl} 
                alt="ü ILLÜMMAA logo" 
                className="h-12 w-auto" 
                style={{
                  filter: 'invert(1)'
                }}
                data-testid="footer-company-name"
              />
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
