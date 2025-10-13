import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { analytics } from "@/lib/analytics";
import compactModelImage from "@assets/onebr_1759539133138.png";
import familyModelImage from "@assets/twobr_1759539819723.png";
import executiveModelImage from "@assets/3brs_1759540307580.png";
import ImagePlaceholder from "./image-placeholder";
import { useTranslation } from "react-i18next";

export default function ModelsShowcase() {
  const { t } = useTranslation();
  const getModelRoute = (index: number) => {
    const routes = ["/models/1br-compact", "/models/2br-family", "/models/3br-executive"];
    return routes[index];
  };

  const handleModelClick = (modelTitle: string, modelRoute: string) => {
    // Track model navigation click
    analytics.trackModelNavigation(modelTitle, 'homepage_models_section');
  };

  const models = [
    {
      title: t('models.model1br.name'),
      size: t('models.model1br.size'),
      description: t('models.model1br.description'),
      price: t('models.model1br.price'),
      image: compactModelImage,
      hasRealImage: true,
      features: t('models.model1br.features', { returnObjects: true }) as string[],
      imageAlt: t('models.model1br.imageAlt')
    },
    {
      title: t('models.model2br.name'),
      size: t('models.model2br.size'),
      description: t('models.model2br.description'),
      price: t('models.model2br.price'),
      image: familyModelImage,
      hasRealImage: true,
      features: t('models.model2br.features', { returnObjects: true }) as string[],
      imageAlt: t('models.model2br.imageAlt')
    },
    {
      title: t('models.model3br.name'),
      size: t('models.model3br.size'),
      description: t('models.model3br.description'),
      price: t('models.model3br.price'),
      image: executiveModelImage,
      hasRealImage: true,
      features: t('models.model3br.features', { returnObjects: true }) as string[],
      imageAlt: t('models.model3br.imageAlt')
    }
  ];

  return (
    <section id="models" className="py-20 bg-muted" data-testid="section-models">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-models-title">
            {t('models.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-models-subtitle">
            {t('models.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="container-models">
          {models.map((model, index) => (
            <div 
              key={index} 
              className="card-hover bg-card rounded-xl sm:rounded-2xl overflow-hidden subtle-elevation subtle-elevation-hover transition-all duration-300"
              data-testid={`card-model-${index + 1}`}
            >
              <div className="model-image-container">
                {model.hasRealImage && model.image ? (
                  <img
                    src={model.image}
                    alt={model.imageAlt}
                    className="model-card-image"
                    loading="lazy"
                    decoding="async"
                    data-testid={`img-model-${index + 1}`}
                  />
                ) : (
                  <ImagePlaceholder
                    title={`${model.title} 3D Rendering`}
                    subtitle="Professional architectural visualization coming soon"
                    type="rendering"
                    className="h-[200px]"
                  />
                )}
              </div>
              <div className="p-8">
                <h3 className="font-display font-bold text-2xl mb-2" data-testid={`heading-model-${index + 1}-title`}>
                  {model.title}
                </h3>
                <p className="text-muted-foreground mb-4" data-testid={`text-model-${index + 1}-size`}>
                  {model.size} • {model.description}
                </p>
                <div className="text-2xl font-bold text-primary mb-4" data-testid={`text-model-${index + 1}-price`}>
                  {model.price}
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6" data-testid={`list-model-${index + 1}-features`}>
                  {model.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center" data-testid={`feature-model-${index + 1}-${featureIndex}`}>
                      <Check className="text-green-500 mr-2" size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={getModelRoute(index)}>
                  <Button
                    className="w-full btn-primary"
                    data-testid={`button-model-${index + 1}-details`}
                    onClick={() => handleModelClick(model.title, getModelRoute(index))}
                  >
                    {t('models.viewDetails')}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-lg" data-testid="text-pricing-note">
            {t('models.disclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
}
