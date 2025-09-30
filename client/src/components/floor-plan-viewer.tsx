import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Download, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImagePlaceholder from "./image-placeholder";

interface FloorPlan {
  id: string;
  title: string;
  type: "2d" | "3d" | "dimensions";
  imageUrl?: string;
  pdfUrl?: string;
  width?: number;
  height?: number;
}

interface FloorPlanViewerProps {
  modelName: string;
  floorPlans: FloorPlan[];
  squareFootage?: string;
  bedrooms?: string;
  bathrooms?: string;
}

export default function FloorPlanViewer({
  modelName,
  floorPlans,
  squareFootage,
  bedrooms,
  bathrooms,
}: FloorPlanViewerProps) {
  const [activeTab, setActiveTab] = useState(floorPlans[0]?.id || "2d");
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleReset = () => {
    setZoomLevel(100);
  };

  return (
    <section className="py-12 bg-gray-50" data-testid="section-floor-plans">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Floor Plans & Specifications
            </h2>
            <p className="text-lg text-muted-foreground">
              Detailed layout and dimensions for the {modelName}
            </p>
          </div>

          {squareFootage && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
                <Grid3x3 className="w-8 h-8 mx-auto mb-2 text-community-primary" />
                <p className="text-sm text-muted-foreground mb-1">
                  Total Area
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {squareFootage}
                </p>
              </div>
              {bedrooms && (
                <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
                  <div className="text-2xl mb-2">🛏️</div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Bedrooms
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {bedrooms}
                  </p>
                </div>
              )}
              {bathrooms && (
                <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
                  <div className="text-2xl mb-2">🚿</div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Bathrooms
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {bathrooms}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200 px-6 py-4">
                <TabsList className="w-full justify-start">
                  {floorPlans.map((plan) => (
                    <TabsTrigger key={plan.id} value={plan.id}>
                      {plan.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="p-6">
                <div className="flex justify-end gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 50}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="ml-2">{zoomLevel}%</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 200}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                    <span className="ml-2">Download</span>
                  </Button>
                </div>

                {floorPlans.map((plan) => (
                  <TabsContent key={plan.id} value={plan.id} className="mt-0">
                    <div className="flex justify-center items-center min-h-[400px] bg-gray-50 rounded-lg overflow-auto">
                      {plan.pdfUrl ? (
                        <a 
                          href={plan.pdfUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-12 hover:shadow-xl transition-all cursor-pointer border-2 border-green-200 hover:border-green-300 text-center"
                        >
                          <div className="text-6xl mb-4">📐</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">View Technical Floor Plan</h3>
                          <p className="text-gray-600 mb-4">Click to open detailed PDF floor plan in a new tab</p>
                          <span className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                            Open Floor Plan PDF
                          </span>
                        </a>
                      ) : plan.imageUrl ? (
                        <div
                          className="transition-transform duration-300"
                          style={{
                            transform: `scale(${zoomLevel / 100})`,
                            transformOrigin: "center center",
                          }}
                        >
                          <img
                            src={plan.imageUrl}
                            alt={`${modelName} - ${plan.title}`}
                            className="max-w-full h-auto rounded-lg shadow-md"
                            style={{
                              maxWidth: plan.width || "800px",
                              maxHeight: plan.height || "600px",
                            }}
                          />
                        </div>
                      ) : (
                        <ImagePlaceholder
                          title={`${plan.title} Coming Soon`}
                          subtitle={`Professional ${plan.title.toLowerCase()} for ${modelName} in progress`}
                          type="floorplan"
                          className="w-full"
                        />
                      )}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>

          <div className="mt-8 bg-community-neutral/30 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">About These Floor Plans</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="text-community-primary mr-2">•</span>
                <span>All dimensions shown are approximate and subject to final engineering</span>
              </li>
              <li className="flex items-start">
                <span className="text-community-primary mr-2">•</span>
                <span>Custom modifications available for qualified developers</span>
              </li>
              <li className="flex items-start">
                <span className="text-community-primary mr-2">•</span>
                <span>Floor plans designed to meet Canadian building codes</span>
              </li>
              <li className="flex items-start">
                <span className="text-community-primary mr-2">•</span>
                <span>Energy-efficient layouts optimized for modular construction</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}