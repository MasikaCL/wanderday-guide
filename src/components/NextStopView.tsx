import { motion, AnimatePresence } from "framer-motion";
import { Stop } from "@/data/types";
import { CategoryBadge } from "./CategoryBadge";
import { MapPin, Navigation, Clock, SkipForward, Check } from "lucide-react";

interface NextStopViewProps {
  currentStop: Stop;
  nextStop: Stop | null;
  kidMode: boolean;
  isLastStop: boolean;
  onArrive: () => void;
  onSkip: () => void;
  currentIndex: number;
  totalStops: number;
}

export function NextStopView({
  currentStop,
  nextStop,
  kidMode,
  isLastStop,
  onArrive,
  onSkip,
  currentIndex,
  totalStops,
}: NextStopViewProps) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Current location */}
      <div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm border border-border">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20 text-2xl">
          {currentStop.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            📍 You are here
          </p>
          <p className="font-display font-bold text-lg truncate">{currentStop.name}</p>
          <CategoryBadge category={currentStop.category} />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {currentIndex + 1}/{totalStops}
        </span>
      </div>

      {/* Kid-friendly description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStop.id + "-desc"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-xl bg-card p-4 shadow-sm border border-border"
        >
          <p className="text-sm leading-relaxed">
            {kidMode
              ? currentStop.kidDescription || currentStop.notes
              : currentStop.notes}
          </p>
          {currentStop.duration && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Spend ~{currentStop.duration} min here</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next destination preview */}
      {nextStop && (
        <AnimatePresence mode="wait">
          <motion.div
            key={nextStop.id + "-next"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl bg-secondary/10 p-4 border border-secondary/20"
          >
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">
              👉 Next up
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{nextStop.emoji}</span>
              <div className="flex-1">
                <p className="font-display font-bold">{nextStop.name}</p>
                <CategoryBadge category={nextStop.category} />
              </div>
            </div>
            {currentStop.walkingTimeToNext && (
              <div className="flex items-center gap-1.5 mt-3 text-sm text-secondary font-medium">
                <Navigation className="h-4 w-4" />
                <span>{currentStop.walkingTimeToNext} min walk</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-2">
        {!isLastStop && (
          <button
            onClick={onSkip}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-card py-4 text-sm font-semibold text-muted-foreground active:scale-95 transition-transform"
          >
            <SkipForward className="h-5 w-5" />
            Skip
          </button>
        )}
        <motion.button
          onClick={onArrive}
          whileTap={{ scale: 0.95 }}
          className={`flex-[2] flex items-center justify-center gap-2 rounded-xl py-4 text-lg font-display font-bold shadow-lg transition-colors ${
            isLastStop
              ? "bg-success text-success-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          <Check className="h-6 w-6" />
          {isLastStop ? "Finish Day! 🎉" : "I'm Here!"}
        </motion.button>
      </div>

      {/* Navigate button */}
      {nextStop && currentStop.walkingTimeToNext && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nextStop.name + " Venice")}&travelmode=walking`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground py-3.5 font-semibold text-sm active:scale-95 transition-transform"
        >
          <MapPin className="h-5 w-5" />
          Open Walking Directions
        </a>
      )}
    </div>
  );
}
