import { useState, useCallback } from "react";
import { DayPlan } from "@/data/types";

export function useItinerary(plan: DayPlan) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [kidMode, setKidMode] = useState(true);
  const [completedStops, setCompletedStops] = useState<Set<string>>(new Set());

  const currentStop = plan.stops[currentStopIndex];
  const nextStop = plan.stops[currentStopIndex + 1] ?? null;
  const isLastStop = currentStopIndex === plan.stops.length - 1;
  const progress = ((currentStopIndex) / (plan.stops.length - 1)) * 100;

  const arrive = useCallback(() => {
    setCompletedStops((prev) => new Set(prev).add(currentStop.id));
    if (!isLastStop) {
      setCurrentStopIndex((i) => i + 1);
    }
  }, [currentStop, isLastStop]);

  const skip = useCallback(() => {
    if (!isLastStop) {
      setCurrentStopIndex((i) => i + 1);
    }
  }, [isLastStop]);

  const goToStop = useCallback((index: number) => {
    setCurrentStopIndex(index);
  }, []);

  const totalWalkingTime = plan.stops.reduce(
    (sum, s) => sum + (s.walkingTimeToNext ?? 0),
    0
  );

  const remainingWalkingTime = plan.stops
    .slice(currentStopIndex)
    .reduce((sum, s) => sum + (s.walkingTimeToNext ?? 0), 0);

  return {
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
    totalWalkingTime,
    remainingWalkingTime,
    totalStops: plan.stops.length,
  };
}
