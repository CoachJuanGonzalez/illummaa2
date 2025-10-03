import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import StickyHeader from "@/components/sticky-header";
import Footer from "@/components/footer";
import FloorPlanViewer from "@/components/floor-plan-viewer";
import exteriorImage from "@assets/3bedroom-1_1757890999523.jpg";
import interiorImage from "@assets/3bedroom-2_1757891004660.jpg";

// Technical plan images (1400px, 300 DPI, 100% quality, architect info removed)
import floorPlanImage from "@assets/3br-technical-plans/floor-plan-main.jpg";
import techCoverPage from "@assets/3br-technical-plans/cover-page.jpg";
import techElevationsFR from "@assets/3br-technical-plans/elevations-front-rear.jpg";

export default function Model3BRExecutive() {
  const [location, navigate] = useLocation();

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
  }, []);

  // Custom function to navigate to home and scroll to models section
  const goBackToModels = () => {
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
            Home
          </Link>
          <span>&gt;</span>
          <span>Models</span>
          <span>&gt;</span>
          <span className="text-foreground">3BR Executive</span>
        </nav>
      </div>

      {/* Header Section */}
      <section className="py-20 bg-muted" data-testid="section-model-header">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display font-bold text-4xl md:text-6xl text-foreground mb-4" data-testid="heading-model-title">
              3BR Executive
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6" data-testid="text-model-subtitle">
              1200 sq ft • Premium family living • Volume pricing available for qualified developers
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-8">
              <div className="text-3xl font-bold text-primary" data-testid="text-model-price">
                Starting from $199K CAD
              </div>
              <div className="text-xl font-medium text-accent" data-testid="text-volume-pricing">
                Volume discounts for 50+ units
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
              Modern Exterior Design
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
              Modern design perfect for communities and individual families
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
                Partnership Advantages
              </h2>
              
              <ul className="space-y-3 mb-8 text-lg">
                <li className="flex items-start">
                  <span className="text-accent mr-3">•</span>
                  72-hour assembly timeline per unit for rapid development
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-3">•</span>
                  Volume pricing discounts (30-40% cost savings vs traditional construction)
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-3">•</span>
                  Factory precision manufacturing with superior quality control
                </li>
              </ul>

              <h2 className="font-display font-bold text-3xl text-foreground mb-6">
                Your Home. Your Lifestyle.
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Illummaa isn't just about building houses, it's about creating spaces where your story unfolds:
              </p>
              
              <ul className="space-y-3 mb-8 text-lg">
                <li className="flex items-start">
                  <span className="text-primary mr-3">•</span>
                  Family moments around the kitchen table.
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3">•</span>
                  Quiet mornings with light streaming through oversized windows.
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3">•</span>
                  A backyard that feels like an extension of your living room.
                </li>
              </ul>
              
              <p className="text-lg text-muted-foreground mb-12">
                Our homes are built to adapt to you, not the other way around.
              </p>

              <h2 className="font-display font-bold text-3xl text-foreground mb-6">
                Affordable Luxury Without Compromise
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8">
                Why choose between quality and affordability? Illummaa combines smart design, efficient construction, and sustainable practices to give you more home for your money. Every detail from energy-efficient materials to timeless finishes is crafted to make you proud of where you live.
              </p>

              <h2 className="font-display font-bold text-3xl text-foreground mb-6">
                Designed to Inspire Confidence
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6">
                Whether it's your first home, a family upgrade, or a modern retreat, Illummaa homes are:
              </p>
              
              <ul className="space-y-3 mb-12 text-lg">
                <li className="flex items-start">
                  <span className="text-primary mr-3">•</span>
                  Beautifully designed with clean lines and natural light.
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3">•</span>
                  Flexible to suit different budgets, families, and lifestyles.
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3">•</span>
                  Built with integrity, so you can feel secure about your investment.
                </li>
              </ul>
            </div>

            {/* Interior Lifestyle Section */}
            <div className="mb-12">
              <h2 className="font-display font-bold text-3xl text-foreground mb-6 text-center" data-testid="heading-interior">
                Premium Interior Living
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
                Premium interior finishes and open concept design for modern living
              </p>
            </div>

            {/* Model Features */}
            <div className="bg-muted rounded-2xl p-8 mb-12">
              <h3 className="font-display font-bold text-2xl mb-6" data-testid="heading-model-features">
                3BR Executive Features
              </h3>
              <ul className="space-y-3 text-lg" data-testid="list-model-features">
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Master suite with ensuite (family comfort + development efficiency)</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Open concept design (lifestyle appeal + construction optimization)</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Smart home ready (modern living + community scalability)</span>
                </li>
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
                Back to Models
              </Button>
            </div>
          </div>
        </div>
      </section>

      <FloorPlanViewer
        modelName="3BR Executive"
        squareFootage="1200 sq ft"
        bedrooms="3"
        bathrooms="2"
        floorPlans={[
          {
            id: "ground-floor",
            title: "Ground Floor Plan",
            type: "2d",
            imageUrl: floorPlanImage,
          },
          {
            id: "cover",
            title: "Cover Page",
            type: "2d",
            imageUrl: techCoverPage,
          },
          {
            id: "elevations-fr",
            title: "Elevations (Front/Rear)",
            type: "2d",
            imageUrl: techElevationsFR,
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