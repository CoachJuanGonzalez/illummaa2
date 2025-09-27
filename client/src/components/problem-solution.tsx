import { AlertTriangle, Lightbulb } from "lucide-react";
import ImagePlaceholder from "./image-placeholder";

export default function ProblemSolution() {
  return (
    <section className="py-20" data-testid="section-problem-solution">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-8" data-testid="heading-housing-crisis">
                The Housing Crisis Demands Industrial Solutions
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4" data-testid="container-problem">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2" data-testid="heading-problem">The Problem</h3>
                    <p className="text-muted-foreground text-lg" data-testid="text-problem-description">
                      Canadian housing shortage: 500,000+ annual shortfall. Traditional construction can't meet demand.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4" data-testid="container-solution">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2" data-testid="heading-solution">The Solution</h3>
                    <p className="text-muted-foreground text-lg" data-testid="text-solution-description">
                      Industrial modular: 4x faster construction, 30-40% cost savings, predictable timelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <ImagePlaceholder
                title="ILLÜMMAA Modular Construction"
                subtitle="Professional photography of our factory production and on-site installation coming soon"
                type="photo"
                className="rounded-2xl shadow-2xl w-full min-h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
