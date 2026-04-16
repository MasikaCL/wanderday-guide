import { useState } from "react";
import { motion } from "framer-motion";
import { Stop } from "@/data/types";
import { CategoryBadge } from "./CategoryBadge";
import { Check, Pencil, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

interface StopListProps {
  stops: Stop[];
  currentIndex: number;
  completedStops: Set<string>;
  kidMode: boolean;
  onSelectStop: (index: number) => void;
  onEditStop: (stop: Stop) => void;
  onRemoveStop: (stop: Stop) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function StopList({
  stops,
  currentIndex,
  completedStops,
  kidMode,
  onSelectStop,
  onEditStop,
  onRemoveStop,
  onReorder,
}: StopListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="px-4 pb-8 flex flex-col gap-2">
      {stops.map((stop, i) => {
        const isCompleted = completedStops.has(stop.id);
        const isCurrent = i === currentIndex;
        const isExpanded = expandedId === stop.id;

        return (
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            layout
            className={`rounded-xl border transition-all ${
              isCurrent
                ? "bg-primary/10 border-primary shadow-md"
                : isCompleted
                ? "bg-muted/50 border-border opacity-60"
                : "bg-card border-border"
            }`}
          >
            {/* Main row */}
            <button
              onClick={() => onSelectStop(i)}
              className="flex items-center gap-3 p-4 w-full text-left"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xl shrink-0 ${
                  isCompleted ? "bg-success/20" : isCurrent ? "bg-primary/20" : "bg-muted"
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5 text-success" /> : stop.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-display font-bold text-sm truncate ${isCompleted ? "line-through" : ""}`}>
                  {stop.name}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <CategoryBadge category={stop.category} />
                  {stop.duration && (
                    <span className="text-xs text-muted-foreground">~{stop.duration} min</span>
                  )}
                  {stop.walkingTimeToNext && (
                    <span className="text-xs text-muted-foreground">
                      → {stop.walkingTimeToNext} min walk
                    </span>
                  )}
                </div>
                {/* Tags */}
                {stop.tags && stop.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {stop.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedId(isExpanded ? null : stop.id);
                }}
                className="shrink-0 rounded-lg p-2 bg-muted/50 active:bg-muted"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </button>

            {/* Expanded actions */}
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border px-4 py-3 flex items-center gap-2"
              >
                {/* Move up */}
                <button
                  disabled={i === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(i, i - 1);
                  }}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold bg-muted text-muted-foreground disabled:opacity-30 active:bg-border"
                >
                  <ChevronUp className="h-3.5 w-3.5" /> Up
                </button>

                {/* Move down */}
                <button
                  disabled={i === stops.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(i, i + 1);
                  }}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold bg-muted text-muted-foreground disabled:opacity-30 active:bg-border"
                >
                  <ChevronDown className="h-3.5 w-3.5" /> Down
                </button>

                <div className="flex-1" />

                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(null);
                    onEditStop(stop);
                  }}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold bg-secondary/15 text-secondary active:bg-secondary/25"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(null);
                    onRemoveStop(stop);
                  }}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold bg-destructive/15 text-destructive active:bg-destructive/25"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
