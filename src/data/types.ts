export type StopCategory = "food" | "sight" | "break" | "transport" | "gelato";

export type StopTag =
  | "kid-friendly"
  | "stroller-friendly"
  | "quick-stop"
  | "shade-rest"
  | "pregnancy-safe"
  | "vegetarian"
  | "quick-service";

export const ALL_TAGS: { value: StopTag; label: string; emoji: string }[] = [
  { value: "kid-friendly", label: "Kid-friendly", emoji: "👶" },
  { value: "stroller-friendly", label: "Stroller-friendly", emoji: "🍼" },
  { value: "quick-stop", label: "Quick stop", emoji: "⚡" },
  { value: "shade-rest", label: "Shade / rest", emoji: "🌳" },
  { value: "pregnancy-safe", label: "Pregnancy-safe", emoji: "🤰" },
  { value: "vegetarian", label: "Vegetarian", emoji: "🥬" },
  { value: "quick-service", label: "Quick service", emoji: "🏃" },
];

export const CATEGORY_OPTIONS: { value: StopCategory; label: string; emoji: string }[] = [
  { value: "food", label: "Food & Drink", emoji: "🍕" },
  { value: "sight", label: "Sightseeing", emoji: "⛪" },
  { value: "break", label: "Rest & Play", emoji: "🌳" },
  { value: "transport", label: "Transport", emoji: "🚉" },
  { value: "gelato", label: "Gelato", emoji: "🍦" },
];

export interface Stop {
  id: string;
  name: string;
  category: StopCategory;
  duration?: number; // minutes
  notes?: string;
  kidDescription?: string;
  walkingTimeToNext?: number; // minutes
  address?: string;
  filters?: string[]; // legacy
  tags?: StopTag[];
  emoji: string;
}

export interface DayPlan {
  id: string;
  title: string;
  city: string;
  stops: Stop[];
  coverEmoji: string;
}

export const CATEGORY_EMOJI: Record<StopCategory, string> = {
  food: "🍕",
  sight: "⛪",
  break: "🌳",
  transport: "🚉",
  gelato: "🍦",
};

/** Anchor stops that trigger alternative suggestions when removed */
export const ANCHOR_STOPS = [
  "Piazza San Marco",
  "Rialto Bridge",
  "Grand Canal Vaporetto Ride",
  "Santa Lucia Station",
];
