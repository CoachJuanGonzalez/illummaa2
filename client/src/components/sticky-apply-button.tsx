import { useState, useEffect } from "react";
import { Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "../lib/analytics";
import { useTranslation } from "react-i18next";

export default function StickyApplyButton() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after user scrolls past hero (600px)
      const heroHeight = 600;
      const scrolled = window.scrollY > heroHeight;

      // Hide button when form is visible on screen
      const formElement = document.getElementById("developer-qualification");
      if (formElement) {
        const formRect = formElement.getBoundingClientRect();
        const formIsVisible = formRect.top < window.innerHeight && formRect.bottom > 0;
        setIsFormVisible(formIsVisible);
      }

      setIsVisible(scrolled && !isFormVisible);
    };

    // Initial check
    handleScroll();

    // Listen to scroll events
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFormVisible]);

  const scrollToForm = () => {
    // Track click with correct analytics method
    analytics.trackNavigation({
      action: 'sticky_cta_click',
      category: 'Conversion',
      section_name: 'Apply Now',
      navigation_type: 'scroll',
      label: 'Sticky Apply Button',
      custom_parameters: {
        button_location: 'floating_sticky',
        target_section: 'developer-qualification',
        scroll_depth: Math.round((window.scrollY / document.documentElement.scrollHeight) * 100)
      }
    });

    const element = document.getElementById("developer-qualification");
    if (element) {
      // Calculate scroll position with header offset
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 80;
      const elementRect = element.getBoundingClientRect();
      const targetPosition = elementRect.top + window.scrollY - headerHeight - 20;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth"
      });
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop Sticky Button (Bottom Right) */}
      <div
        className="hidden md:block fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-5 duration-500"
        data-testid="sticky-apply-desktop"
      >
        <Button
          onClick={scrollToForm}
          size="lg"
          className="btn-primary text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-full"
          data-testid="button-sticky-apply"
        >
          <Handshake className="mr-3" size={24} />
          {t('stickyButton.desktop')}
        </Button>
      </div>

      {/* Mobile Sticky Button (Bottom Full Width) */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-500"
        data-testid="sticky-apply-mobile"
      >
        <Button
          onClick={scrollToForm}
          size="lg"
          className="btn-primary text-white w-full py-6 text-lg font-semibold rounded-xl"
          data-testid="button-sticky-apply-mobile"
        >
          <Handshake className="mr-3" size={24} />
          {t('stickyButton.mobile')}
        </Button>
      </div>
    </>
  );
}
