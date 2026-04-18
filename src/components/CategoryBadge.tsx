import { StopCategory } from "@/data/types";

const config: Record<StopCategory, { bg: string; fg: string; label: string; emoji: string; clip: string }> = {
  food:      { bg: "bg-category-food",      fg: "text-category-food-foreground",      label: "Food",      emoji: "🍕", clip: "rounded-full" },
  sight:     { bg: "bg-category-sight",     fg: "text-category-sight-foreground",     label: "Sights",    emoji: "⛪", clip: "rounded-[40%_60%_55%_45%/50%_45%_55%_50%]" },
  break:     { bg: "bg-category-break",     fg: "text-category-break-foreground",     label: "Rest",      emoji: "🌳", clip: "rounded-[60%_40%_55%_45%/45%_55%_45%_55%]" },
  transport: { bg: "bg-category-transport", fg: "text-category-transport-foreground", label: "Transport", emoji: "🚉", clip: "rounded-[55%_45%_60%_40%/55%_50%_50%_45%]" },
  gelato:    { bg: "bg-category-gelato",    fg: "text-category-gelato-foreground",    label: "Gelato",    emoji: "🍦", clip: "rounded-[50%_50%_30%_70%/30%_50%_50%_70%]" },
};

export function CategoryBadge({ category, withEmoji = false }: { category: StopCategory; withEmoji?: boolean }) {
  const c = config[category];
  return (
    <span className={`inline-flex items-center gap-1 border-[1.5px] border-foreground rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${c.bg} ${c.fg}`}>
      {withEmoji && <span className="text-xs">{c.emoji}</span>}
      {c.label}
    </span>
  );
}

/** Shape-character icon for category — for larger displays */
export function CategoryShape({ category, size = 48 }: { category: StopCategory; size?: number }) {
  const c = config[category];
  return (
    <div
      className={`flex items-center justify-center border-[2.5px] border-foreground shadow-sticker-sm ${c.bg} ${c.fg} ${c.clip}`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.5 }}>{c.emoji}</span>
    </div>
  );
}
