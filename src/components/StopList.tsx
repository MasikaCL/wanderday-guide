import { useState } from "react";
import { motion } from "framer-motion";
import { Stop } from "@/data/types";
import { CategoryBadge } from "./CategoryBadge";
import { OpenInMapsSheet } from "./OpenInMapsSheet";
import { Check, Pencil, Trash2, GripVertical, ChevronUp, ChevronDown, MapPin } from "lucide-react";

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
  stops, currentIndex, completedStops, onSelectStop, onEditStop, onRemoveStop, onReorder,
}: StopListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mapsStop, setMapsStop] = useState<Stop | null>(null);
  const hasLoc = (s: Stop) => !!s.address || (s.lat != null && s.lng != null);

  return (
    <div className="px-4 pb-24 flex flex-col gap-3">
      {stops.map((stop, i) => {
        const isCompleted = completedStops.has(stop.id);
        const isCurrent = i === currentIndex;
        const isExpanded = expandedId === stop.id;

        return (
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            layout
            className={`sticker rounded-3xl transition-all ${
              isCurrent ? "bg-primary/20" : isCompleted ? "bg-card opacity-60" : "bg-card"
            }`}
          >
            <button
              onClick={() => onSelectStop(i)}
              className="flex items-center gap-3 p-4 w-full text-left"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl shrink-0 border-[2.5px] border-foreground ${
                isCompleted ? "bg-success" : isCurrent ? "bg-primary text-primary-foreground" : "bg-background"
              }`}>
                {isCompleted ? <Check className="h-5 w-5" /> : stop.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-display text-base leading-tight truncate ${isCompleted ? "line-through" : ""}`}>
                  {stop.name}
                </p>
                {stop.address && (
                  <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <CategoryBadge category={stop.category} />
                  {stop.duration ? <span className="text-[11px] font-extrabold text-foreground/60">~{stop.duration}min</span> : null}
                  {stop.walkingTimeToNext ? <span className="text-[11px] font-extrabold text-foreground/60">→ {stop.walkingTimeToNext}min walk</span> : null}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : stop.id); }}
                className="shrink-0 sticker-sm rounded-full p-2 bg-background"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            </button>

            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                className="border-t-[2.5px] border-foreground px-4 py-3 flex items-center gap-2 flex-wrap"
              >
                <button
                  disabled={i === 0}
                  onClick={(e) => { e.stopPropagation(); onReorder(i, i - 1); }}
                  className="sticker-sm rounded-xl px-3 py-2 text-xs font-extrabold bg-background disabled:opacity-30 flex items-center gap-1"
                >
                  <ChevronUp className="h-3.5 w-3.5" /> Up
                </button>
                <button
                  disabled={i === stops.length - 1}
                  onClick={(e) => { e.stopPropagation(); onReorder(i, i + 1); }}
                  className="sticker-sm rounded-xl px-3 py-2 text-xs font-extrabold bg-background disabled:opacity-30 flex items-center gap-1"
                >
                  <ChevronDown className="h-3.5 w-3.5" /> Down
                </button>

                <div className="flex-1" />

                {hasLoc(stop) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setMapsStop(stop); }}
                    className="sticker-sm rounded-xl px-3 py-2 text-xs font-extrabold bg-category-transport text-category-transport-foreground flex items-center gap-1"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Maps
                  </button>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedId(null); onEditStop(stop); }}
                  className="sticker-sm rounded-xl px-3 py-2 text-xs font-extrabold bg-secondary text-secondary-foreground flex items-center gap-1"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedId(null); onRemoveStop(stop); }}
                  className="sticker-sm rounded-xl px-3 py-2 text-xs font-extrabold bg-destructive text-destructive-foreground flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </motion.div>
            )}
          </motion.div>
        );
      })}
      <OpenInMapsSheet open={!!mapsStop} stop={mapsStop} onClose={() => setMapsStop(null)} />
    </div>
  );
}
