export type StopCategory = "food" | "sight" | "break" | "transport" | "gelato";

export interface Stop {
  id: string;
  name: string;
  category: StopCategory;
  duration?: number; // minutes
  notes?: string;
  kidDescription?: string;
  walkingTimeToNext?: number; // minutes
  address?: string;
  filters?: string[]; // kid-friendly, vegetarian, etc.
  emoji: string;
}

export interface DayPlan {
  id: string;
  title: string;
  city: string;
  stops: Stop[];
  coverEmoji: string;
}
