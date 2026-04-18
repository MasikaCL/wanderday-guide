import shapePink from "@/assets/shape-pink.svg";
import shapeGreen from "@/assets/shape-green.svg";
import shapeYellow from "@/assets/shape-yellow.svg";

const map = { pink: shapePink, green: shapeGreen, yellow: shapeYellow };

interface ShapeAvatarProps {
  variant: "pink" | "green" | "yellow";
  size?: number;
  className?: string;
}

export function ShapeAvatar({ variant, size = 96, className = "" }: ShapeAvatarProps) {
  return (
    <div
      className={`shrink-0 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={map[variant]}
        alt=""
        aria-hidden
        className="w-full h-full object-contain"
        style={{ filter: "drop-shadow(2px 3px 0 hsl(var(--border)))" }}
      />
    </div>
  );
}
