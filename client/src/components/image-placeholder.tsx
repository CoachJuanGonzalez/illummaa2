import { ImageOff, Camera } from "lucide-react";

interface ImagePlaceholderProps {
  title?: string;
  subtitle?: string;
  type?: "rendering" | "photo" | "floorplan";
  className?: string;
}

export default function ImagePlaceholder({
  title = "Professional Rendering Coming Soon",
  subtitle = "High-quality architectural visualization in progress",
  type = "rendering",
  className = "",
}: ImagePlaceholderProps) {
  const getIcon = () => {
    switch (type) {
      case "photo":
        return <Camera className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-community-primary/30 transition-all" />;
      case "floorplan":
        return <ImageOff className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-community-accent/30 transition-all" />;
      default:
        return <ImageOff className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-community-primary/30 transition-all" />;
    }
  };

  return (
    <div
      className={`relative w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden ${className}`}
      style={{ minHeight: "280px" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center">
        <div className="mb-3 sm:mb-4 md:mb-6 transform transition-transform hover:scale-105 duration-300">
          {getIcon()}
        </div>
        
        <h3 className="font-semibold text-base sm:text-lg md:text-xl text-gray-800 mb-2 px-2 max-w-xs sm:max-w-sm md:max-w-md">
          {title}
        </h3>
        
        <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-[280px] sm:max-w-sm md:max-w-md px-2 leading-relaxed">
          {subtitle}
        </p>
        
        <div className="mt-4 sm:mt-5 md:mt-6 inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-community-primary/5 border border-community-primary/20 rounded-full backdrop-blur-sm transition-all hover:bg-community-primary/10">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-community-primary animate-pulse"></div>
          <span className="text-[10px] sm:text-xs font-medium text-community-primary">
            In Production
          </span>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20 pointer-events-none"></div>
      
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      ></div>
    </div>
  );
}