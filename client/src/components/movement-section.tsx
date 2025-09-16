import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import buildingCanadaImage from "@assets/Generated Image September 14, 2025 - 11_48AM_1757864918811.png";

export default function MovementSection() {
  const scrollToAssessment = () => {
    const element = document.getElementById("developer-qualification");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20" data-testid="section-movement">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img 
                src={buildingCanadaImage} 
                alt="Modern modular home showcasing contemporary design and sustainable living in Canadian landscape" 
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
                onClick={scrollToAssessment} 
                className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 btn-primary text-white hover:transform hover:translateY(-1px)"
                data-testid="button-learn-more"
                title="Learn More"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
