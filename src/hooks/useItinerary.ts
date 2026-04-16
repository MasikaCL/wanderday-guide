import { useState, useCallback } from "react";
import { DayPlan, Stop, ANCHOR_STOPS } from "@/data/types";

export interface SmartSuggestion {
  type: "alternative" | "dense";
  message: string;
  stopId?: string;
}

function estimateWalkingTime(): number {
  // Simulated walking time between 3-15 min
  return Math.floor(Math.random() * 12) + 3;
}

function recalcWalkingTimes(stops: Stop[]): Stop[] {
  return stops.map((stop, i) => ({
    ...stop,
    walkingTimeToNext: i < stops.length - 1 ? estimateWalkingTime() : undefined,
  }));
}

function checkDensity(stops: Stop[]): SmartSuggestion | null {
  if (stops.length > 12) {
    return {
      type: "dense",
      message: "This day has many stops close together. Consider removing one for a calmer pace. 🧘",
    };
  }
  return null;
}

export function useItinerary(initialPlan: DayPlan) {
  const [stops, setStops] = useState<Stop[]>(initialPlan.stops);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [kidMode, setKidMode] = useState(true);
  const [completedStops, setCompletedStops] = useState<Set<string>>(new Set());
  const [suggestion, setSuggestion] = useState<SmartSuggestion | null>(null);

  const currentStop = stops[currentStopIndex];
  const nextStop = stops[currentStopIndex + 1] ?? null;
  const isLastStop = currentStopIndex === stops.length - 1;
  const progress = stops.length > 1 ? (currentStopIndex / (stops.length - 1)) * 100 : 0;

  const arrive = useCallback(() => {
    setCompletedStops((prev) => new Set(prev).add(stops[currentStopIndex].id));
    if (currentStopIndex < stops.length - 1) {
      setCurrentStopIndex((i) => i + 1);
    }
  }, [stops, currentStopIndex]);

  const skip = useCallback(() => {
    if (currentStopIndex < stops.length - 1) {
      setCurrentStopIndex((i) => i + 1);
    }
  }, [stops, currentStopIndex]);

  const goToStop = useCallback((index: number) => {
    setCurrentStopIndex(index);
  }, []);

  // --- CRUD ---

  const addStop = useCallback((newStop: Stop, position: "end" | "after-current") => {
    setStops((prev) => {
      let updated: Stop[];
      if (position === "after-current") {
        updated = [
          ...prev.slice(0, currentStopIndex + 1),
          newStop,
          ...prev.slice(currentStopIndex + 1),
        ];
      } else {
        updated = [...prev, newStop];
      }
      updated = recalcWalkingTimes(updated);
      const dense = checkDensity(updated);
      if (dense) setSuggestion(dense);
      return updated;
    });
  }, [currentStopIndex]);

  const editStop = useCallback((id: string, updates: Partial<Stop>) => {
    setStops((prev) => {
      let updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      // If category changed, recalculate
      if (updates.category) {
        updated = recalcWalkingTimes(updated);
      }
      return updated;
    });
  }, []);

  const removeStop = useCallback((id: string) => {
    const stop = stops.find((s) => s.id === id);
    if (!stop) return;

    // Check if anchor
    if (ANCHOR_STOPS.includes(stop.name)) {
      setSuggestion({
        type: "alternative",
        message: `You removed "${stop.name}". Want a nearby alternative stop? You can add one from the Add Stop menu.`,
        stopId: id,
      });
    }

    setStops((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const updated = recalcWalkingTimes(prev.filter((s) => s.id !== id));

      // Adjust current index if needed
      if (idx <= currentStopIndex && currentStopIndex > 0) {
        setCurrentStopIndex((i) => Math.max(0, i - 1));
      }

      const dense = checkDensity(updated);
      if (dense) setSuggestion(dense);
      return updated;
    });
  }, [stops, currentStopIndex]);

  const reorderStops = useCallback((fromIndex: number, toIndex: number) => {
    setStops((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return recalcWalkingTimes(updated);
    });
  }, []);

  const dismissSuggestion = useCallback(() => setSuggestion(null), []);

  const remainingWalkingTime = stops
    .slice(currentStopIndex)
    .reduce((sum, s) => sum + (s.walkingTimeToNext ?? 0), 0);

  return {
    stops,
    currentStop,
    nextStop,
    currentStopIndex,
    isLastStop,
    progress,
    kidMode,
    setKidMode,
    completedStops,
    arrive,
    skip,
    goToStop,
    addStop,
    editStop,
    removeStop,
    reorderStops,
    remainingWalkingTime,
    totalStops: stops.length,
    suggestion,
    dismissSuggestion,
  };
}
