import { useState } from 'react';
import { ZoomIn, ZoomOut, Download, Ruler, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveFloorPlanProps {
  modelName: string;
  floorPlanImage: string;
  dimensions: {
    totalSqFt: number;
    bedrooms: number;
    bathrooms: number;
    width: number;
    length: number;
  };
}

export default function InteractiveFloorPlan({
  modelName,
  floorPlanImage,
  dimensions
}: InteractiveFloorPlanProps) {
  const [zoom, setZoom] = useState(100);
  const [showDimensions, setShowDimensions] = useState(true);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 20, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 20, 50));
  };

  const handleDownload = () => {
    // Download floor plan - requires actual PDF generation
    const link = document.createElement('a');
    link.href = floorPlanImage;
    link.download = `${modelName}-floor-plan.pdf`;
    link.click();
  };

  const toggleDimensions = () => {
    setShowDimensions(!showDimensions);
  };

  const hotspots = [
    { x: 30, y: 40, label: 'Living Area', size: '450 sq ft' },
    { x: 70, y: 30, label: 'Master Bedroom', size: '280 sq ft' },
    { x: 70, y: 60, label: 'Kitchen', size: '180 sq ft' },
    { x: 30, y: 75, label: 'Bathroom', size: '90 sq ft' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" data-testid="container-floor-plan">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xl" data-testid="heading-floor-plan-title">
              {modelName} Floor Plan
            </h3>
            <p className="text-sm opacity-90">Interactive technical drawing</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDimensions}
              className="text-white hover:bg-white/20"
              data-testid="button-toggle-dimensions"
              aria-label="Toggle dimensions"
            >
              <Ruler size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
              data-testid="button-download-plan"
              aria-label="Download floor plan"
            >
              <Download size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Floor Plan Image */}
      <div className="relative bg-gray-50 p-8">
        <div
          className="relative mx-auto transition-transform duration-300"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center'
          }}
        >
          <img
            src={floorPlanImage}
            alt={`${modelName} detailed floor plan`}
            className="w-full h-auto model-floorplan-image"
            data-testid="img-floor-plan"
          />

          {/* Interactive Hotspots */}
          {showDimensions && hotspots.map((hotspot, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              data-testid={`hotspot-${index}`}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                <Info size={16} />
              </div>
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white rounded-lg px-3 py-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                <p className="font-semibold">{hotspot.label}</p>
                <p className="text-gray-300">{hotspot.size}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2 bg-white rounded-full px-2 py-2 shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom === 50}
            className="hover:bg-gray-100"
            data-testid="button-zoom-out"
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </Button>
          <span className="px-2 flex items-center text-sm font-semibold">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom === 200}
            className="hover:bg-gray-100"
            data-testid="button-zoom-in"
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </Button>
        </div>
      </div>

      {/* Dimensions Panel */}
      {showDimensions && (
        <div className="bg-muted px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-4" data-testid="panel-dimensions">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{dimensions.totalSqFt}</p>
            <p className="text-sm text-muted-foreground">Total Sq Ft</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{dimensions.bedrooms}</p>
            <p className="text-sm text-muted-foreground">Bedrooms</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{dimensions.bathrooms}</p>
            <p className="text-sm text-muted-foreground">Bathrooms</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{dimensions.width}'</p>
            <p className="text-sm text-muted-foreground">Width</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{dimensions.length}'</p>
            <p className="text-sm text-muted-foreground">Length</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          All dimensions are approximate. Custom modifications available for 50+ unit projects.
        </p>
      </div>
    </div>
  );
}