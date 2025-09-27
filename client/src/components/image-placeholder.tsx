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
        return <Camera className="w-16 h-16 text-community-primary/40" />;
      case "floorplan":
        return <ImageOff className="w-16 h-16 text-community-accent/40" />;
      default:
        return <ImageOff className="w-16 h-16 text-community-primary/40" />;
    }
  };

  return (
    <div
      className={`relative w-full bg-gradient-to-br from-community-neutral to-gray-100 rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: "300px" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4">{getIcon()}</div>
        <h3 className="font-semibold text-lg text-gray-700 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 max-w-md">{subtitle}</p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
          <div className="w-2 h-2 rounded-full bg-community-primary animate-pulse"></div>
          <span className="text-xs font-medium text-gray-600">
            In Production
          </span>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent pointer-events-none"></div>
    </div>
  );
}