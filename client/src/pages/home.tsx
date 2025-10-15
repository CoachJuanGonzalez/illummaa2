import { useEffect } from "react";
import { useLocation } from "wouter";
import StickyHeader from "@/components/sticky-header";
import HeroSection from "@/components/hero-section";
import SocialProof from "@/components/social-proof";
import ProblemSolution from "@/components/problem-solution";
import LeadershipTeam from "@/components/leadership-team";
import AssessmentForm from "@/components/assessment-form";
import ModelsShowcase from "@/components/models-showcase";
// import CommunityTestimonials from "@/components/community-testimonials"; // TEMPORARILY HIDDEN - Will re-enable when real testimonials are collected
import PartnershipTiers from "@/components/partnership-tiers";
import GovernmentPrograms from "@/components/government-programs";
import MovementSection from "@/components/movement-section";
import Footer from "@/components/footer";
import StickyApplyButton from "@/components/sticky-apply-button";
import { useSEO } from "@/hooks/useSEO";
import { getSEOConfig, getBreadcrumbConfig } from "@/lib/seo-config";
import { getOrganizationSchema, getBreadcrumbSchema, injectMultipleSchemas } from "@/lib/schema";

export default function Home() {
  const [location] = useLocation();
  const language = location.startsWith('/fr') ? 'fr' : 'en';
  const seoData = getSEOConfig('home', language);

  // Apply SEO meta tags
  useSEO({
    title: seoData.title,
    titleFr: language === 'fr' ? seoData.title : undefined,
    description: seoData.description,
    descriptionFr: language === 'fr' ? seoData.description : undefined,
    keywords: seoData.keywords,
    keywordsFr: language === 'fr' ? seoData.keywords : undefined,
    ogImage: seoData.ogImage,
    language: language
  });

  // Inject Organization and Breadcrumb schemas
  useEffect(() => {
    const organizationSchema = getOrganizationSchema(language);
    const breadcrumbSchema = getBreadcrumbSchema(getBreadcrumbConfig('home', language));

    injectMultipleSchemas([
      { schema: organizationSchema, id: 'organization' },
      { schema: breadcrumbSchema, id: 'breadcrumb' }
    ]);
  }, [language]);

  return (
    <div className="bg-background text-foreground">
      <StickyHeader />
      <StickyApplyButton />
      <div>
        <HeroSection />
        <ProblemSolution />
        <SocialProof />
        <ModelsShowcase />
        {/* <CommunityTestimonials /> */} {/* TEMPORARILY HIDDEN - Will re-enable when real testimonials are collected */}
        <LeadershipTeam />
        <GovernmentPrograms />
        <PartnershipTiers />
        <MovementSection />
        <AssessmentForm />
        <Footer />
      </div>
    </div>
  );
}
