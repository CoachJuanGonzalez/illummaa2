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
        return <Camera className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 text-community-primary/40 transition-all hover:scale-110 hover:text-community-primary/60 duration-500" />;
      case "floorplan":
        return <ImageOff className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 text-community-accent/40 transition-all hover:scale-110 hover:text-community-accent/60 duration-500" />;
      default:
        return <ImageOff className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 text-community-primary/40 transition-all hover:scale-110 hover:text-community-primary/60 duration-500" />;
    }
  };

  return (
    <div
      className={`w-full flex flex-col items-center justify-center text-center py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 ${className}`}
    >
      <div className="mb-4 sm:mb-6 md:mb-8 transform transition-all duration-500">
        {getIcon()}
      </div>
      
      <h3 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-900 mb-3 sm:mb-4 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
        {title}
      </h3>
      
      <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-[280px] sm:max-w-md md:max-w-lg leading-relaxed mb-6 sm:mb-8">
        {subtitle}
      </p>
      
      <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-community-primary/10 border-2 border-community-primary/30 rounded-full transition-all hover:bg-community-primary/20 hover:border-community-primary/50 hover:scale-105 duration-300">
        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-community-primary animate-pulse"></div>
        <span className="text-xs sm:text-sm md:text-base font-semibold text-community-primary">
          In Production
        </span>
      </div>
    </div>
  );
}