import { StopCategory } from "@/data/types";

const config: Record<StopCategory, { bg: string; fg: string; label: string; emoji: string }> = {
  food: { bg: "bg-[#FFE8E8]", fg: "text-[#CC8585]", label: "Food", emoji: "🍕" },
  sight: { bg: "bg-[#EDE8FF]", fg: "text-[#9A8BC9]", label: "Sights", emoji: "⛪" },
  break: { bg: "bg-[#E8FFF4]", fg: "text-[#81C5A8]", label: "Rest", emoji: "🌳" },
  transport: { bg: "bg-[#E8F4FF]", fg: "text-[#7FA6CC]", label: "Transport", emoji: "🚉" },
  gelato: { bg: "bg-[#FFF3E8]", fg: "text-[#CCAA85]", label: "Gelato", emoji: "🍦" },
};

export function CategoryBadge({ category, withEmoji = false }: { category: StopCategory; withEmoji?: boolean }) {
  const c = config[category];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${c.bg} ${c.fg}`}>
      <span className="text-xs">{c.emoji}</span>
      {c.label}
    </span>
  );
}

/** Shape-character icon for category — for larger displays */
export function CategoryShape({ category, size = 48 }: { category: StopCategory; size?: number }) {
  const c = config[category];
  return (
    <div
      className={`flex items-center justify-center rounded-full ${c.bg} ${c.fg}`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.5 }}>{c.emoji}</span>
    </div>
  );
}
