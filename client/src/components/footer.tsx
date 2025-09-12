import { Linkedin, Twitter, Instagram, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="contact" className="bg-foreground text-background py-16" data-testid="footer-main">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2" data-testid="section-company-info">
            <div className="flex items-center space-x-3 mb-6" data-testid="footer-logo">
              <div className="w-8 h-8">
                <svg width="32" height="32" viewBox="0 0 64 64" aria-label="ILLÜMMAA emblem">
                  <circle cx="16" cy="10" r="3" fill="#FFFFFF"/>
                  <circle cx="48" cy="10" r="3" fill="#FFFFFF"/>
                  <path d="M16 16v16c0 12 8 20 16 20s16-8 16-20V16" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="logo-text text-2xl text-white font-bold" data-testid="footer-company-name">ILLÜMMAA</span>
            </div>
            <p className="text-white/80 text-lg mb-6 max-w-md" data-testid="footer-company-description">
              Industrial modular homes for Canada's housing future. Building faster, smarter, and more sustainably.
            </p>
            <div className="flex space-x-4" data-testid="social-links">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors" data-testid="link-linkedin">
                <Linkedin className="text-white" size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors" data-testid="link-twitter">
                <Twitter className="text-white" size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors" data-testid="link-instagram">
                <Instagram className="text-white" size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div data-testid="section-quick-links">
            <h3 className="font-semibold text-white text-lg mb-6" data-testid="heading-quick-links">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => scrollToSection("assessment")} 
                  className="text-white/80 hover:text-white transition-colors text-left"
                  data-testid="link-footer-assessment"
                >
                  Assessment
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("why")} 
                  className="text-white/80 hover:text-white transition-colors text-left"
                  data-testid="link-footer-why"
                >
                  Why ILLÜMMAA
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("models")} 
                  className="text-white/80 hover:text-white transition-colors text-left"
                  data-testid="link-footer-models"
                >
                  Models
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("partnership")} 
                  className="text-white/80 hover:text-white transition-colors text-left"
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
                partners@illummaa.com
              </li>
              <li className="text-white/80 flex items-center" data-testid="contact-location">
                <MapPin className="mr-2" size={16} />
                Toronto, Ontario
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
