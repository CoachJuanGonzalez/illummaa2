import { useState, useEffect } from "react";
import StickyHeader from "@/components/sticky-header";
import HeroSection from "@/components/hero-section";
import SocialProof from "@/components/social-proof";
import ProblemSolution from "@/components/problem-solution";
import WhyIllummaa from "@/components/why-illummaa";
import LeadershipTeam from "@/components/leadership-team";
import AssessmentForm from "@/components/assessment-form";
import ModelsShowcase from "@/components/models-showcase";
import PartnershipTiers from "@/components/partnership-tiers";
import GovernmentPrograms from "@/components/government-programs";
import MovementSection from "@/components/movement-section";
import Footer from "@/components/footer";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile browsers for content spacing
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

  return (
    <div className="bg-background text-foreground">
      <StickyHeader />
      <div className={isMobile ? 'pt-20' : ''}>
        <HeroSection />
        <SocialProof />
        <ProblemSolution />
        <WhyIllummaa />
        <LeadershipTeam />
        <AssessmentForm />
        <ModelsShowcase />
        <PartnershipTiers />
        <GovernmentPrograms />
        <MovementSection />
        <Footer />
      </div>
    </div>
  );
}
