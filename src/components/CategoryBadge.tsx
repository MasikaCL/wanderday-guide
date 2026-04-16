import { StopCategory } from "@/data/types";

const categoryConfig: Record<StopCategory, { bg: string; text: string; label: string }> = {
  food: { bg: "bg-category-food/20", text: "text-category-food", label: "Food" },
  sight: { bg: "bg-category-sight/20", text: "text-category-sight", label: "Sightseeing" },
  break: { bg: "bg-category-rest/20", text: "text-category-rest", label: "Rest & Play" },
  transport: { bg: "bg-category-transport/20", text: "text-category-transport", label: "Transport" },
  gelato: { bg: "bg-category-gelato/20", text: "text-category-gelato", label: "Gelato" },
};

export function CategoryBadge({ category }: { category: StopCategory }) {
  const config = categoryConfig[category];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
