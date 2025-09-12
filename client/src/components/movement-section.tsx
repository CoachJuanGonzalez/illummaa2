import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResidentialSection from "./residential-section";

export default function MovementSection() {
  const [showResidentialSection, setShowResidentialSection] = useState(false);
  
  const handleLearnMore = () => {
    setShowResidentialSection(!showResidentialSection);
  };

  return (
    <section className="py-20" data-testid="section-movement">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Aerial view of modern modular home community development" 
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="img-community-aerial"
              />
            </div>
            <div>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-8" data-testid="heading-movement-title">
                Building Canada's Housing Future
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-movement-description">
                From housing shortage to housing abundance. From traditional delays to industrial precision. 
                Join the movement transforming how Canada builds homes.
              </p>
              <div className="space-y-4 mb-8" data-testid="container-movement-points">
                <div className="flex items-center space-x-3" data-testid="point-housing-needed">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="text-white" size={16} />
                  </div>
                  <span className="text-lg">500,000+ homes needed annually</span>
                </div>
                <div className="flex items-center space-x-3" data-testid="point-modular-solution">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="text-white" size={16} />
                  </div>
                  <span className="text-lg">Industrial modular: The scalable solution</span>
                </div>
                <div className="flex items-center space-x-3" data-testid="point-opportunity">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="text-white" size={16} />
                  </div>
                  <span className="text-lg">Your opportunity to lead the transformation</span>
                </div>
              </div>
              <Button 
                onClick={handleLearnMore} 
                className="btn-primary px-8 py-4 rounded-2xl text-white font-semibold text-lg"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Residential Section - Reveals when "Learn More" is clicked */}
        {showResidentialSection && (
          <div className="container mx-auto px-6 mt-12">
            <div className="max-w-4xl mx-auto">
              <ResidentialSection
                projectUnitCount={0}
                budgetRange="Under $5 Million"
                leadType="Consumer Information Request Form"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
