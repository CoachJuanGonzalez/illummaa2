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
import floorPlanImage from "@assets/1br-compact-floorplan.jpg";

const floorPlanPDF = "/attached_assets/1 BEDROOM 1.5 BATH_1759197665520.pdf";

export default function Model1BRCompact() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation();
  const language = location.startsWith('/fr') ? 'fr' : 'en';
  const seoData = getSEOConfig('model1BR', language);

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
    analytics.trackModelPageView('1BR Compact', '/models/1br-compact');
  }, []);

  // Inject Product and Breadcrumb schemas
  useEffect(() => {
    const productSchema = getProductSchema(
      language === 'fr' ? "Maison modulaire 1 chambre compacte" : "1BR Compact Modular Home",
      language === 'fr'
        ? "Maison modulaire 1 chambre: 937 pi², à partir de 129K$ CAD. Parfait pour densité urbaine. Concept ouvert, écoénergétique, finitions haut de gamme. Pour développeurs qualifiés (10+ unités)."
        : "937 sq ft modular home perfect for urban density. Open concept living, energy efficient appliances, premium finishes. Starting from $129,000 CAD for qualified developers (10+ units).",
      "https://illummaa.com/models/1br-compact-image.png",
      "129000",
      `https://illummaa.com/${language}/models/1br-compact`,
      language
    );

    const breadcrumbSchema = getBreadcrumbSchema(getBreadcrumbConfig('model1BR', language));

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
      label: 'Back to Models from 1BR Compact',
      custom_parameters: {
        source_model: '1BR Compact',
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
          <span className="text-foreground">{t('modelPages.model1br.title')}</span>
        </nav>
      </div>

      {/* Header Section */}
      <section className="py-20 bg-muted" data-testid="section-model-header">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display font-bold text-4xl md:text-6xl text-foreground mb-4" data-testid="heading-model-title">
              {t('modelPages.model1br.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6" data-testid="text-model-subtitle">
              {t('modelPages.model1br.subtitle')}
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-8">
              <div className="text-lg text-muted-foreground" data-testid="text-model-specs">
                {t('modelPages.model1br.specs')}
              </div>
              <div className="text-3xl font-bold text-primary" data-testid="text-model-price">
                {t('modelPages.model1br.price')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floor Plan Section */}
      <section className="py-16 bg-background" data-testid="section-floor-plan">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-6" data-testid="heading-floor-plan">
              {t('modelPages.common.floorPlanTitle')}
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
              <img
                src={floorPlanImage}
                alt="1BR Compact floor plan - 937 sq ft technical drawing"
                className="model-floorplan-image max-w-4xl mx-auto cursor-pointer"
                loading="lazy"
                decoding="async"
                data-testid="img-floor-plan"
                onClick={() => window.open(floorPlanPDF, '_blank')}
              />
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {t('modelPages.common.floorPlanClickInstructions')}
              </p>
            </div>
            <p className="text-lg text-muted-foreground" data-testid="text-floor-plan-caption">
              {t('modelPages.model1br.floorPlanCaption')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20" data-testid="section-model-content">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none mb-12">
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

            {/* Model Features */}
            <div className="bg-muted rounded-2xl p-8 mb-12">
              <h3 className="font-display font-bold text-2xl mb-6" data-testid="heading-model-features">
                {t('modelPages.model1br.featuresTitle')}
              </h3>
              <ul className="space-y-3 text-lg" data-testid="list-model-features">
                {t('modelPages.model1br.features', { returnObjects: true }).map((feature: string, index: number) => (
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
        modelName="1BR Compact"
        squareFootage="937 sq ft"
        bedrooms="1"
        bathrooms="1.5"
        floorPlans={[
          {
            id: "2d",
            title: "2D Floor Plan",
            type: "2d",
            imageUrl: floorPlanImage,
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