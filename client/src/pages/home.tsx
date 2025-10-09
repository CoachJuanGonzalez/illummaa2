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

export default function Home() {
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
