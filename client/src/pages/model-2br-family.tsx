import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import StickyHeader from "@/components/sticky-header";
import Footer from "@/components/footer";

export default function Model2BRFamily() {
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
          <span className="text-foreground">2BR Family</span>
        </nav>
      </div>

      {/* Header Section */}
      <section className="py-20 bg-muted" data-testid="section-model-header">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display font-bold text-4xl md:text-6xl text-foreground mb-4" data-testid="heading-model-title">
              2BR Family
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6" data-testid="text-model-subtitle">
              Your Home. Your Lifestyle.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-8">
              <div className="text-lg text-muted-foreground" data-testid="text-model-specs">
                900 sq ft • Ideal for young families
              </div>
              <div className="text-3xl font-bold text-primary" data-testid="text-model-price">
                Starting from $169K CAD
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20" data-testid="section-model-content">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none mb-12">
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

            {/* Model Features */}
            <div className="bg-muted rounded-2xl p-8 mb-12">
              <h3 className="font-display font-bold text-2xl mb-6" data-testid="heading-model-features">
                2BR Family Features
              </h3>
              <ul className="space-y-3 text-lg" data-testid="list-model-features">
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Two spacious bedrooms</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Full kitchen & dining</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Private outdoor space ready</span>
                </li>
              </ul>
            </div>

            {/* Back Navigation */}
            <div className="flex justify-center py-6">
              <Link href="/">
                <Button variant="outline" size="lg" className="min-h-[44px] px-6 mx-4" data-testid="button-back">
                  <ArrowLeft className="mr-2" size={20} />
                  Back to Models
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}