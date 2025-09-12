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
  return (
    <div className="bg-background text-foreground">
      <StickyHeader />
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
  );
}
