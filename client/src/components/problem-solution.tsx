import { AlertTriangle, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProblemSolution() {
  const { t } = useTranslation();

  return (
    <section className="py-20" data-testid="section-problem-solution">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-8 text-center" data-testid="heading-housing-crisis">
            {t('problemSolution.title')}
          </h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4" data-testid="container-problem">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2" data-testid="heading-problem">{t('problemSolution.problemTitle')}</h3>
                <p className="text-muted-foreground text-lg" data-testid="text-problem-description">
                  {t('problemSolution.problemText')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4" data-testid="container-solution">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2" data-testid="heading-solution">{t('problemSolution.solutionTitle')}</h3>
                <p className="text-muted-foreground text-lg" data-testid="text-solution-description">
                  {t('problemSolution.solutionText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
