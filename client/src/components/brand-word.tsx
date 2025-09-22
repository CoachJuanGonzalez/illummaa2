import { cn } from "@/lib/utils";

interface BrandWordProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export default function BrandWord({ className, size = 'md' }: BrandWordProps) {
  // Size configurations for responsive scaling
  const sizeConfig = {
    sm: { width: 120, height: 20, fontSize: 18, letterSpacing: 2 },
    md: { width: 150, height: 24, fontSize: 22, letterSpacing: 2.5 },
    lg: { width: 180, height: 28, fontSize: 26, letterSpacing: 3 },
    xl: { width: 240, height: 36, fontSize: 34, letterSpacing: 4 },
    '2xl': { width: 300, height: 44, fontSize: 42, letterSpacing: 5 },
    '3xl': { width: 360, height: 52, fontSize: 50, letterSpacing: 6 },
    '4xl': { width: 480, height: 68, fontSize: 66, letterSpacing: 8 },
    '5xl': { width: 600, height: 84, fontSize: 82, letterSpacing: 10 }
  };

  const { width, height, fontSize, letterSpacing } = sizeConfig[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("brand-word", className)}
      aria-label="ILLÜMMAA"
      role="img"
    >
      {/* Professional typography with properly aligned umlaut dots */}
      <defs>
        <style>{`
          .brand-letter {
            font-family: 'Inter', 'SF Pro Display', 'Helvetica Neue', sans-serif;
            font-weight: 700;
            font-size: ${fontSize}px;
            fill: currentColor;
            text-anchor: middle;
            dominant-baseline: central;
          }
          .umlaut-dot {
            fill: currentColor;
            r: ${fontSize * 0.05}px;
          }
        `}</style>
      </defs>
      
      {/* Base letters */}
      <text x={letterSpacing} y={height/2} className="brand-letter">I</text>
      <text x={letterSpacing * 3} y={height/2} className="brand-letter">L</text>
      <text x={letterSpacing * 5} y={height/2} className="brand-letter">L</text>
      
      {/* U with properly aligned dots on vertical strokes */}
      <text x={letterSpacing * 7} y={height/2} className="brand-letter">U</text>
      {/* Left dot - aligned with left vertical stroke of U */}
      <circle 
        cx={letterSpacing * 7 - fontSize * 0.15} 
        cy={height/2 - fontSize * 0.35} 
        className="umlaut-dot" 
      />
      {/* Right dot - aligned with right vertical stroke of U */}
      <circle 
        cx={letterSpacing * 7 + fontSize * 0.15} 
        cy={height/2 - fontSize * 0.35} 
        className="umlaut-dot" 
      />
      
      {/* Remaining letters */}
      <text x={letterSpacing * 9} y={height/2} className="brand-letter">M</text>
      <text x={letterSpacing * 11} y={height/2} className="brand-letter">M</text>
      <text x={letterSpacing * 13} y={height/2} className="brand-letter">A</text>
      <text x={letterSpacing * 15} y={height/2} className="brand-letter">A</text>
    </svg>
  );
}