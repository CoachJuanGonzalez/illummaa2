import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import buildingCanadaImage from "@assets/Generated Image September 14, 2025 - 11_48AM_1757864918811.png";
import { useTranslation } from "react-i18next";

export default function MovementSection() {
  const { t } = useTranslation();
  const scrollToAssessment = () => {
    const element = document.getElementById("developer-qualification");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 bg-muted" data-testid="section-movement">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src={buildingCanadaImage}
                alt={t('movement.imageAlt')}
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="img-community-aerial"
              />
            </div>
            <div>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-8" data-testid="heading-movement-title">
                {t('movement.title')}
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-movement-description">
                {t('movement.description')}
              </p>
              <div className="space-y-4 mb-8" data-testid="container-movement-points">
                {(t('movement.highlights', { returnObjects: true }) as string[]).map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-3" data-testid={`point-${index}`}>
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="text-white" size={16} />
                    </div>
                    <span className="text-lg">{highlight}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={scrollToAssessment}
                className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 btn-primary text-white hover:transform hover:translateY(-1px)"
                data-testid="button-learn-more"
                title={t('movement.ctaTitle')}
              >
                {t('movement.cta')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
