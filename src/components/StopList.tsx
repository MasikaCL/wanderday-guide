import { motion } from "framer-motion";
import { Stop } from "@/data/types";
import { CategoryBadge } from "./CategoryBadge";
import { Check } from "lucide-react";

interface StopListProps {
  stops: Stop[];
  currentIndex: number;
  completedStops: Set<string>;
  kidMode: boolean;
  onSelectStop: (index: number) => void;
}

export function StopList({ stops, currentIndex, completedStops, kidMode, onSelectStop }: StopListProps) {
  return (
    <div className="px-4 pb-8 flex flex-col gap-2">
      {stops.map((stop, i) => {
        const isCompleted = completedStops.has(stop.id);
        const isCurrent = i === currentIndex;

        return (
          <motion.button
            key={stop.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelectStop(i)}
            className={`flex items-center gap-3 rounded-xl p-4 text-left transition-all border ${
              isCurrent
                ? "bg-primary/10 border-primary shadow-md"
                : isCompleted
                ? "bg-muted/50 border-border opacity-60"
                : "bg-card border-border"
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
              isCompleted ? "bg-success/20" : isCurrent ? "bg-primary/20" : "bg-muted"
            }`}>
              {isCompleted ? <Check className="h-5 w-5 text-success" /> : stop.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-display font-bold text-sm truncate ${isCompleted ? "line-through" : ""}`}>
                {stop.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <CategoryBadge category={stop.category} />
                {stop.walkingTimeToNext && (
                  <span className="text-xs text-muted-foreground">
                    → {stop.walkingTimeToNext} min
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{i + 1}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
