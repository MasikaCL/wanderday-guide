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
  { value: "food", label: "Food", emoji: "🍕" },
  { value: "sight", label: "Sights", emoji: "⛪" },
  { value: "break", label: "Rest", emoji: "🌳" },
  { value: "transport", label: "Transport", emoji: "🚉" },
  { value: "gelato", label: "Gelato", emoji: "🍦" },
];

export interface StopLocation {
  address?: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
}

export interface Stop {
  id: string;
  name: string;
  category: StopCategory;
  duration?: number;
  notes?: string;
  kidDescription?: string;
  walkingTimeToNext?: number;
  address?: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
  tags?: StopTag[];
  emoji: string;
  startTime?: string;
  facts?: string[];
  spotIt?: string;
}

export interface Adventure {
  id: string;
  name: string;
  city: string;
  date?: string;
  coverEmoji: string;
  shapeVariant: "pink" | "green" | "yellow";
  currentStopIndex: number;
  kidMode: boolean;
  stops?: Stop[];
}

export const SHAPE_VARIANTS = ["pink", "green", "yellow"] as const;

export const CATEGORY_EMOJI: Record<StopCategory, string> = {
  food: "🍕",
  sight: "⛪",
  break: "🌳",
  transport: "🚉",
  gelato: "🍦",
};

export const ANCHOR_STOPS = [
  "Piazza San Marco",
  "Rialto Bridge",
  "Grand Canal Vaporetto Ride",
  "Santa Lucia Station",
];
