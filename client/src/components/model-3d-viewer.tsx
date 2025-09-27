import { useState } from 'react';
import { Maximize2, RotateCw, ZoomIn, ZoomOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Model3DViewerProps {
  modelName: string;
  matterportId?: string;
  fallbackImage?: string;
}

export default function Model3DViewer({
  modelName,
  matterportId = 'placeholder',
  fallbackImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
}: Model3DViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  return (
    <div
      className={`relative bg-gray-100 rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      data-testid="container-3d-viewer"
    >
      {/* 3D Model Container */}
      <div
        className="relative w-full aspect-video"
        style={{
          transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Matterport Embed (requires actual Matterport model ID) */}
        {matterportId !== 'placeholder' ? (
          <iframe
            src={`https://my.matterport.com/show/?m=${matterportId}`}
            frameBorder="0"
            allowFullScreen
            className="w-full h-full"
            title={`3D Model: ${modelName}`}
            data-testid="iframe-matterport"
          />
        ) : (
          // Fallback: Static image with 3D effect
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <img
              src={fallbackImage}
              alt={`3D visualization of ${modelName}`}
              className="max-w-full max-h-full object-contain"
              data-testid="img-3d-fallback"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <Home size={64} className="mx-auto mb-4 opacity-80" />
                <p className="text-xl font-semibold mb-2">3D Model View</p>
                <p className="text-sm opacity-90">Matterport integration required</p>
                <p className="text-xs mt-2 opacity-75">Model ID: {matterportId}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/70 rounded-full px-4 py-2 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRotate}
          className="text-white hover:bg-white/20"
          data-testid="button-rotate"
          aria-label="Rotate model"
        >
          <RotateCw size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="text-white hover:bg-white/20"
          data-testid="button-zoom-in"
          aria-label="Zoom in"
        >
          <ZoomIn size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="text-white hover:bg-white/20"
          data-testid="button-zoom-out"
          aria-label="Zoom out"
        >
          <ZoomOut size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFullscreen}
          className="text-white hover:bg-white/20"
          data-testid="button-fullscreen"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <Maximize2 size={20} />
        </Button>
      </div>

      {/* Model Info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
        <p className="text-sm font-semibold text-gray-800" data-testid="text-model-name">
          {modelName}
        </p>
        <p className="text-xs text-gray-600">Interactive 3D Model</p>
      </div>

      {/* Setup Notice */}
      {matterportId === 'placeholder' && (
        <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg px-3 py-2 text-xs text-yellow-800 max-w-xs">
          <p className="font-semibold mb-1">🏗️ 3D Model Setup Required</p>
          <p>Upload Matterport model or provide 3D asset URL</p>
        </div>
      )}
    </div>
  );
}