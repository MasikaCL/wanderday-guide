import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stop } from "@/data/types";
import { CategoryBadge } from "./CategoryBadge";
import { OpenInMapsSheet } from "./OpenInMapsSheet";
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
  currentStop, nextStop, kidMode, isLastStop, onArrive, onSkip, currentIndex, totalStops,
}: NextStopViewProps) {
  const [mapsStop, setMapsStop] = useState<Stop | null>(null);
  const hasLoc = (s: Stop | null) => !!s && (!!s.address || (s.lat != null && s.lng != null));

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Current location */}
      <div className="sticker p-4 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full text-2xl bg-[#F5A7C7]/40">
          {currentStop.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">You are here</p>
          <p className="font-display text-lg leading-tight truncate">{currentStop.name}</p>
          {currentStop.address && (
            <p className="text-xs text-muted-foreground truncate">{currentStop.address}</p>
          )}
          <div className="mt-1"><CategoryBadge category={currentStop.category} /></div>
        </div>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1}/{totalStops}
        </span>
      </div>

      {hasLoc(currentStop) && (
        <button
          onClick={() => setMapsStop(currentStop)}
          className="rounded-full bg-secondary text-foreground py-2.5 px-4 text-xs flex items-center gap-2 self-start border-0"
        >
          <MapPin className="h-4 w-4" /> Open in Maps
        </button>
      )}

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStop.id + "-desc"}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="sticker bg-[#FFF3E8] p-4"
        >
          <p className="text-sm leading-relaxed">
            {kidMode ? currentStop.kidDescription || currentStop.notes : currentStop.notes}
          </p>
          {currentStop.duration ? (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Spend ~{currentStop.duration} min here</span>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Next */}
      {nextStop && (
        <AnimatePresence mode="wait">
          <motion.div
            key={nextStop.id + "-next"}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="sticker bg-[#EDE8FF] p-4"
          >
            <p className="text-xs text-muted-foreground mb-1.5">Next up</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{nextStop.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display text-base leading-tight truncate">{nextStop.name}</p>
                {nextStop.address && (
                  <p className="text-xs text-muted-foreground truncate">{nextStop.address}</p>
                )}
                <div className="mt-1"><CategoryBadge category={nextStop.category} /></div>
              </div>
            </div>
            {currentStop.walkingTimeToNext ? (
              <div className="flex items-center gap-1.5 mt-3 text-sm text-[#9A8BC9]">
                <Navigation className="h-4 w-4" />
                <span>{currentStop.walkingTimeToNext} min walk</span>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-1">
        {!isLastStop && (
          <button
            onClick={onSkip}
            className="py-4 px-3 flex items-center justify-center gap-2 flex-1 text-sm text-[#7FA6CC] bg-transparent border-0"
          >
            <SkipForward className="h-5 w-5" /> Skip
          </button>
        )}
        <motion.button
          onClick={onArrive}
          whileTap={{ scale: 0.96 }}
          className={`rounded-full flex-[2] py-4 flex items-center justify-center gap-2 text-lg font-display border-0 ${
            isLastStop ? "bg-[#7ECEC4] text-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          <Check className="h-6 w-6" />
          {isLastStop ? "Finish day" : "I'm here"}
        </motion.button>
      </div>

      {/* Walking directions to NEXT stop */}
      {nextStop && hasLoc(nextStop) && (
        <button
          onClick={() => setMapsStop(nextStop)}
          className="rounded-full bg-[#B8A9D9] text-foreground py-3.5 flex items-center justify-center gap-2 text-sm border-0"
        >
          <MapPin className="h-5 w-5" /> Open walking directions
        </button>
      )}

      <OpenInMapsSheet open={!!mapsStop} stop={mapsStop} onClose={() => setMapsStop(null)} />
    </div>
  );
}
