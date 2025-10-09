import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import compactModelImage from "@assets/onebr_1759539133138.png";
import familyModelImage from "@assets/twobr_1759539819723.png";
import executiveModelImage from "@assets/3brs_1759540307580.png";
import ImagePlaceholder from "./image-placeholder";

export default function ModelsShowcase() {
  const getModelRoute = (index: number) => {
    const routes = ["/models/1br-compact", "/models/2br-family", "/models/3br-executive"];
    return routes[index];
  };

  const models = [
    {
      title: "1BR Compact",
      size: "937 sq ft",
      description: "Perfect for urban density",
      price: "Starting from $129K CAD",
      image: compactModelImage,
      hasRealImage: true,
      features: [
        "Open concept living",
        "Energy efficient appliances",
        "Premium finishes"
      ]
    },
    {
      title: "2BR Family",
      size: "1179 sq ft",
      description: "Ideal for young families",
      price: "Starting from $169K CAD",
      image: familyModelImage,
      hasRealImage: true,
      features: [
        "Two spacious bedrooms",
        "Full kitchen & dining",
        "Private outdoor space ready"
      ]
    },
    {
      title: "3BR Executive",
      size: "1360 sq ft",
      description: "Premium family living",
      price: "Starting from $199K CAD",
      image: executiveModelImage,
      hasRealImage: true,
      features: [
        "Master suite with ensuite",
        "Open concept design",
        "Smart home ready"
      ]
    }
  ];

  return (
    <section id="models" className="py-20 bg-muted" data-testid="section-models">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="heading-models-title">
            Our Model Collection
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-models-subtitle">
            Precision-engineered homes designed for Canadian living. Starting prices for qualified developers.
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
                    alt={`${model.title} exterior view`}
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
                  <Button className="w-full btn-primary" data-testid={`button-model-${index + 1}-details`}>
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-lg" data-testid="text-pricing-note">
            Pricing shown for qualified developers. Volume discounts and custom modifications available.
          </p>
        </div>
      </div>
    </section>
  );
}
