import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stop } from "@/data/types";
import { CategoryBadge } from "./CategoryBadge";
import { OpenInMapsSheet } from "./OpenInMapsSheet";
import { MapPin, Navigation, Clock, SkipForward, Check, Pencil, RotateCw, Sparkles, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NextStopViewProps {
  currentStop: Stop;
  nextStop: Stop | null;
  kidMode: boolean;
  isLastStop: boolean;
  onArrive: () => void;
  onSkip: () => void;
  currentIndex: number;
  totalStops: number;
  onEditStop: (stop: Stop) => void;
  onUpdateStop: (id: string, updates: Partial<Stop>) => Promise<void> | void;
}

export function NextStopView({
  currentStop, nextStop, kidMode, isLastStop, onArrive, onSkip, currentIndex, totalStops,
  onEditStop, onUpdateStop,
}: NextStopViewProps) {
  const [mapsStop, setMapsStop] = useState<Stop | null>(null);
  const [generating, setGenerating] = useState(false);
  const hasLoc = (s: Stop | null) => !!s && (!!s.address || (s.lat != null && s.lng != null));
  const isSight = currentStop.category === "sight";
  const hasFacts = !!(currentStop.facts && currentStop.facts.length > 0);

  const generate = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sights-info", {
        body: { name: currentStop.name, location: currentStop.address ?? "" },
      });
      if (error) throw error;
      const facts = Array.isArray(data?.facts) ? data.facts : [];
      const spotIt = typeof data?.spotIt === "string" ? data.spotIt : "";
      if (facts.length > 0 || spotIt) {
        await onUpdateStop(currentStop.id, { facts, spotIt });
      }
    } catch (e) {
      console.error("Failed to generate sights info:", e);
    } finally {
      setGenerating(false);
    }
  }, [generating, currentStop.id, currentStop.name, currentStop.address, onUpdateStop]);

  // Auto-generate once for sight stops with no facts yet
  useEffect(() => {
    if (isSight && !hasFacts && !generating) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStop.id]);

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

      <div className="flex flex-wrap gap-2">
        {hasLoc(currentStop) && (
          <button
            onClick={() => setMapsStop(currentStop)}
            className="rounded-full bg-secondary text-foreground py-2.5 px-4 text-xs flex items-center gap-2 border-0"
          >
            <MapPin className="h-4 w-4" /> Open in Maps
          </button>
        )}
        <button
          onClick={() => onEditStop(currentStop)}
          className="rounded-full bg-transparent py-2.5 px-4 text-[14px] flex items-center gap-1.5 border border-[#E8E2DA] text-[#9B95A3]"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit stop
        </button>
      </div>

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
          <div className="mt-2 flex flex-col gap-1">
            {currentStop.duration ? (
              <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#9B95A3" }}>
                <Clock className="h-3.5 w-3.5" />
                <span>Spend ~{currentStop.duration} min here</span>
              </div>
            ) : null}
            {currentStop.startTime ? (
              <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#9B95A3" }}>
                <span>🕐</span>
                <span>Approx start time: {currentStop.startTime}</span>
              </div>
            ) : null}
            {currentStop.duration ? (
              <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#9B95A3" }}>
                <Timer className="h-3.5 w-3.5" />
                <span>Duration: ~{currentStop.duration} min</span>
              </div>
            ) : null}
          </div>

          {/* Sights extras */}
          {isSight && (
            <div className="mt-4 flex flex-col gap-2">
              {/* Quick facts card */}
              <div className="rounded-xl p-3" style={{ background: "#F5F0EA" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] font-display">📖 Quick facts</p>
                  {hasFacts && !generating && (
                    <button
                      onClick={generate}
                      className="text-[11px] flex items-center gap-1 border-0 bg-transparent"
                      style={{ color: "#9B95A3" }}
                    >
                      <RotateCw className="h-3 w-3" /> Regenerate
                    </button>
                  )}
                </div>
                {generating ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 rounded-md skeleton-pulse" style={{ background: "#EDE8E0" }} />
                    <div className="h-3 w-4/5 rounded-md skeleton-pulse" style={{ background: "#EDE8E0" }} />
                  </div>
                ) : hasFacts ? (
                  <ul className="flex flex-col gap-1">
                    {currentStop.facts!.map((f, i) => (
                      <li key={i} className="text-[13px] leading-snug">{f}</li>
                    ))}
                  </ul>
                ) : (
                  <button
                    onClick={generate}
                    className="text-[12px] flex items-center gap-1 border-0 bg-transparent"
                    style={{ color: "#9B95A3" }}
                  >
                    <Sparkles className="h-3 w-3" /> Generate info
                  </button>
                )}
              </div>

              {/* Spot the detail card */}
              {(generating || currentStop.spotIt) && (
                <div className="rounded-xl p-3" style={{ background: "#FFF3E8" }}>
                  <p className="text-[12px] font-display mb-1.5">🎯 Spot the detail</p>
                  {generating ? (
                    <div className="h-3 w-3/4 rounded-md skeleton-pulse" style={{ background: "#EDE8E0" }} />
                  ) : (
                    <p className="text-[13px] leading-snug">{currentStop.spotIt}</p>
                  )}
                </div>
              )}
            </div>
          )}
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
