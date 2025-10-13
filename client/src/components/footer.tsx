import { Linkedin, Twitter, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { trackFooterNavClick, analytics } from "../lib/analytics";
import logoUrl from "@assets/logo-logotype_1759439104156.png";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
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
    <footer id="contact" className="py-20" style={{backgroundColor: '#f1f5f9'}} data-testid="footer-main">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="md:col-span-2 lg:col-span-2 flex flex-col items-center text-center" data-testid="section-company-info">
            <div className="mb-4" data-testid="footer-logo">
              <img 
                src={logoUrl} 
                alt="ü ILLUMMAA logo" 
                className="h-24 w-auto" 
                style={{
                  imageRendering: 'auto',
                  transform: 'scale(0.4)'
                }}
                data-testid="footer-company-name"
              />
            </div>
            <p className="text-base mb-8 max-w-lg leading-relaxed" style={{color: '#1a202c'}} data-testid="footer-company-description">
              {t('footer.description')}
            </p>
            <div className="flex space-x-6" data-testid="social-links">
              <a href="#" onClick={() => trackSocialClick('LinkedIn')} className="min-w-[48px] min-h-[48px] bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary/20 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2" data-testid="link-linkedin" aria-label={t('footer.socialLabels.linkedin')} style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
                <Linkedin style={{color: '#1a202c'}} size={22} />
              </a>
              <a href="#" onClick={() => trackSocialClick('Twitter')} className="min-w-[48px] min-h-[48px] bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary/20 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2" data-testid="link-twitter" aria-label={t('footer.socialLabels.twitter')} style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
                <Twitter style={{color: '#1a202c'}} size={22} />
              </a>
              <a href="#" onClick={() => trackSocialClick('Instagram')} className="min-w-[48px] min-h-[48px] bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary/20 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2" data-testid="link-instagram" aria-label={t('footer.socialLabels.instagram')} style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
                <Instagram style={{color: '#1a202c'}} size={22} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div data-testid="section-quick-links">
            <h3 className="font-semibold text-lg mb-5 md:mb-4 tracking-wide" style={{color: '#1a202c'}} data-testid="heading-quick-links">{t('footer.quickLinks.title')}</h3>
            <ul className="space-y-2 md:space-y-1">
              <li>
                <button
                  onClick={() => scrollToSection("developer-qualification", "Partnership Application")}
                  className="footer-link-enhanced text-left w-full rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  data-testid="link-footer-partnership-application"
                >
                  {t('footer.quickLinks.partnershipApplication')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("why", "Why ILLUMMAA")}
                  className="footer-link-enhanced text-left w-full rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  data-testid="link-footer-why"
                >
                  {t('footer.quickLinks.why')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("models", "Models")}
                  className="footer-link-enhanced text-left w-full rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  data-testid="link-footer-models"
                >
                  {t('footer.quickLinks.models')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("partnership-tiers", "Partnership")}
                  className="footer-link-enhanced text-left w-full rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  data-testid="link-footer-partnership"
                >
                  {t('footer.quickLinks.partnership')}
                </button>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div data-testid="section-contact-info">
            <h3 className="font-semibold text-lg mb-5 md:mb-4 tracking-wide" style={{color: '#1a202c'}} data-testid="heading-contact">{t('footer.contact.title')}</h3>
            <ul className="space-y-3 md:space-y-1.5">
              <li className="flex items-center" style={{color: '#1a202c'}} data-testid="contact-phone">
                <Phone className="mr-2" size={16} style={{color: '#1a202c'}} />
                {t('footer.contact.phone')}
              </li>
              <li className="flex items-center" style={{color: '#1a202c'}} data-testid="contact-email">
                <Mail className="mr-2" size={16} style={{color: '#1a202c'}} />
                <a
                  href="mailto:info@illummaa.com"
                  className="transition-colors hover:text-primary hover:underline cursor-pointer"
                  style={{color: '#1a202c'}}
                  data-testid="link-email"
                >
                  {t('footer.contact.email')}
                </a>
              </li>
              <li className="flex items-center" style={{color: '#1a202c'}} data-testid="contact-location">
                <MapPin className="mr-2" size={16} style={{color: '#1a202c'}} />
                <a
                  href="https://maps.google.com/?q=17550+2nd+Floor+Trans-Canada+Hwy,+Kirkland,+Quebec,+H9J+3A3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{color: '#1a202c'}}
                >
                  {t('footer.contact.address')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-16 pt-12 flex flex-col md:flex-row justify-between items-center" style={{borderColor: 'rgba(0,0,0,0.2)'}} data-testid="footer-bottom">
          <p className="text-sm mb-4 md:mb-0" style={{color: '#1a202c'}} data-testid="copyright">
            {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="transition-colors" style={{color: '#1a202c'}}>{t('footer.privacy')}</a>
            <a href="#" className="transition-colors" style={{color: '#1a202c'}}>{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
