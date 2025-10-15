import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import StickyHeader from "@/components/sticky-header";
import Footer from "@/components/footer";
import FloorPlanViewer from "@/components/floor-plan-viewer";
import { analytics } from "@/lib/analytics";
import { useSEO } from "@/hooks/useSEO";
import { getSEOConfig, getBreadcrumbConfig } from "@/lib/seo-config";
import { getProductSchema, getBreadcrumbSchema, injectMultipleSchemas } from "@/lib/schema";
import exteriorImage from "@assets/3bedroom-1_1757890999523.jpg";
import interiorImage from "@assets/3bedroom-2_1757891004660.jpg";
import floorPlanImage from "@assets/3bedroom-3_1757891009839.jpg";

// PDF path for technical plans
const technicalPlansPDF = "/attached_assets/3-bedroom-technical-plans_1759503916090.pdf";

export default function Model3BRExecutive() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation();
  const language = location.startsWith('/fr') ? 'fr' : 'en';
  const seoData = getSEOConfig('model3BR', language);

  // Apply SEO meta tags
  useSEO({
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    ogImage: seoData.ogImage,
    language: language
  });

  // Universal scroll-to-top on page load for all devices
  useEffect(() => {
    // Primary scroll method
    window.scrollTo(0, 0);
    // Fallback methods for maximum compatibility
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    // setTimeout fallback for slow-loading devices
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    // Track model page view
    analytics.trackModelPageView('3BR Executive', '/models/3br-executive');
  }, []);

  // Inject Product and Breadcrumb schemas
  useEffect(() => {
    const productSchema = getProductSchema(
      language === 'fr' ? "Maison modulaire 3 chambres exécutive" : "3BR Executive Modular Home",
      language === 'fr'
        ? "Maison modulaire exécutive 3 chambres: 1 687 pi², à partir de 249K$ CAD. Finitions haut de gamme, commodités luxueuses, espace bureau. Conçu pour développeurs exigeants (10+ unités)."
        : "1,687 sq ft executive modular home: 3 bedrooms, 2 bathrooms. Starting from $249,000 CAD. Premium finishes, luxury amenities, dedicated home office space. Designed for discerning developers (10+ units).",
      "https://illummaa.com/models/3br-executive-image.png",
      "249000",
      `https://illummaa.com/${language}/models/3br-executive`,
      language
    );

    const breadcrumbSchema = getBreadcrumbSchema(getBreadcrumbConfig('model3BR', language));

    injectMultipleSchemas([
      { schema: productSchema, id: 'product' },
      { schema: breadcrumbSchema, id: 'breadcrumb' }
    ]);
  }, [language]);

  // Custom function to navigate to home and scroll to models section
  const goBackToModels = () => {
    // Track back navigation
    analytics.trackNavigation({
      action: 'back_to_models_click',
      category: 'Model Navigation',
      section_name: 'Back to Models',
      navigation_type: 'model',
      label: 'Back to Models from 3BR Executive',
      custom_parameters: {
        source_model: '3BR Executive',
        target_section: 'models'
      }
    });
    
    navigate('/');
    
    // Wait for navigation to complete, then scroll to models section
    setTimeout(() => {
      const element = document.getElementById('models');
      if (element) {
        // Get the actual sticky header height
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 80;
        
        // Add extra offset for proper positioning
        const isMobile = window.innerWidth < 768;
        const extraOffset = isMobile ? 24 : 10;
        
        // Calculate the target scroll position
        const elementRect = element.getBoundingClientRect();
        const targetPosition = elementRect.top + window.scrollY - headerHeight - extraOffset;
        
        // Scroll to the calculated position
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: "smooth"
        });
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  return (
    <div className="bg-background text-foreground">
      <StickyHeader />
      
      {/* Breadcrumbs */}
      <div className="container mx-auto px-6 pt-8">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" data-testid="breadcrumbs">
          <Link href="/" className="flex items-center hover:text-primary transition-colors">
            <Home size={16} className="mr-1" />
            {t('breadcrumbs.home')}
          </Link>
          <span>&gt;</span>
          <span>{t('breadcrumbs.models')}</span>
          <span>&gt;</span>
          <span className="text-foreground">{t('modelPages.model3br.title')}</span>
        </nav>
      </div>

      {/* Header Section */}
      <section className="py-20 bg-muted" data-testid="section-model-header">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display font-bold text-4xl md:text-6xl text-foreground mb-4" data-testid="heading-model-title">
              {t('modelPages.model3br.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6" data-testid="text-model-subtitle">
              {t('modelPages.model3br.subtitle')}
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-8">
              <div className="text-3xl font-bold text-primary" data-testid="text-model-price">
                {t('modelPages.model3br.price')}
              </div>
              <div className="text-xl font-medium text-accent" data-testid="text-volume-pricing">
                {t('modelPages.model3br.volumePricing')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exterior Rendering Section */}
      <section className="py-16 bg-muted" data-testid="section-exterior">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-6" data-testid="heading-exterior">
              {t('modelPages.model3br.exteriorTitle')}
            </h2>
            <div className="model-image-container rounded-2xl overflow-hidden shadow-xl mb-6">
              <img
                src={exteriorImage}
                alt="3BR Executive exterior rendering - modern single-story modular home"
                className="model-detail-image h-[400px] md:h-[500px]"
                loading="lazy"
                decoding="async"
                data-testid="img-exterior"
              />
            </div>
            <p className="text-lg text-muted-foreground" data-testid="text-exterior-caption">
              {t('modelPages.model3br.exteriorCaption')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20" data-testid="section-model-content">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none mb-12">
              <h2 className="font-display font-bold text-3xl text-foreground mb-6">
                {t('modelPages.model3br.partnershipAdvantagesTitle')}
              </h2>

              <ul className="space-y-3 mb-8 text-lg">
                {t('modelPages.model3br.partnershipAdvantages', { returnObjects: true }).map((advantage: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-accent mr-3">•</span>
                    {advantage}
                  </li>
                ))}
              </ul>

              <h2 className="font-display font-bold text-3xl text-foreground mb-6">
                {t('modelPages.common.yourHome')}
              </h2>

              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                {t('modelPages.common.storyIntro')}
              </p>

              <ul className="space-y-3 mb-8 text-lg">
                {t('modelPages.common.storyFeatures', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <p className="text-lg text-muted-foreground mb-12">
                {t('modelPages.common.storyConclusion')}
              </p>

              <h2 className="font-display font-bold text-3xl text-foreground mb-6">
                {t('modelPages.common.affordableLuxuryTitle')}
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                {t('modelPages.common.affordableLuxuryText')}
              </p>

              <h2 className="font-display font-bold text-3xl text-foreground mb-6">
                {t('modelPages.common.designedTitle')}
              </h2>

              <p className="text-lg text-muted-foreground mb-6">
                {t('modelPages.common.designedIntro')}
              </p>

              <ul className="space-y-3 mb-12 text-lg">
                {t('modelPages.common.designedFeatures', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Interior Lifestyle Section */}
            <div className="mb-12">
              <h2 className="font-display font-bold text-3xl text-foreground mb-6 text-center" data-testid="heading-interior">
                {t('modelPages.model3br.interiorTitle')}
              </h2>
              <div className="model-image-container rounded-2xl overflow-hidden shadow-xl mb-6">
                <img
                  src={interiorImage}
                  alt="3BR Executive interior - premium kitchen and living area"
                  className="model-detail-image h-[400px] md:h-[500px]"
                  loading="lazy"
                  decoding="async"
                  data-testid="img-interior"
                />
              </div>
              <p className="text-lg text-muted-foreground text-center" data-testid="text-interior-caption">
                {t('modelPages.model3br.interiorCaption')}
              </p>
            </div>

            {/* Model Features */}
            <div className="bg-muted rounded-2xl p-8 mb-12">
              <h3 className="font-display font-bold text-2xl mb-6" data-testid="heading-model-features">
                {t('modelPages.model3br.featuresTitle')}
              </h3>
              <ul className="space-y-3 text-lg" data-testid="list-model-features">
                {t('modelPages.model3br.features', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <Check className="text-green-500 mr-3" size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Back Navigation */}
            <div className="flex justify-center py-6">
              <Button
                onClick={goBackToModels}
                variant="outline"
                size="lg"
                className="min-h-[44px] px-6 mx-4"
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2" size={20} />
                {t('modelPages.common.backToModels')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <FloorPlanViewer
        modelName="3BR Executive"
        squareFootage="1360 sq ft"
        bedrooms="3"
        bathrooms="2"
        floorPlans={[
          {
            id: "2d",
            title: "2D Floor Plan",
            type: "2d",
            imageUrl: floorPlanImage,
          },
          {
            id: "technical",
            title: "Technical Plans (PDF)",
            type: "2d",
            pdfUrl: technicalPlansPDF,
          },
          {
            id: "3d",
            title: "3D Isometric View",
            type: "3d",
          },
          {
            id: "dimensions",
            title: "Dimensions & Layout",
            type: "dimensions",
          },
        ]}
      />

      <Footer />
    </div>
  );
}