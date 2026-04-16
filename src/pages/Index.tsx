import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { veniceDayPlan } from "@/data/venice-itinerary";
import { useItinerary } from "@/hooks/useItinerary";
import { ProgressBar } from "@/components/ProgressBar";
import { NextStopView } from "@/components/NextStopView";
import { StopList } from "@/components/StopList";
import { Map, List, Sparkles, Footprints } from "lucide-react";

type Tab = "next" | "list";

const Index = () => {
  const [tab, setTab] = useState<Tab>("next");
  const itinerary = useItinerary(veniceDayPlan);

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-4 pb-3 safe-top">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display font-black text-xl tracking-tight">
              {veniceDayPlan.coverEmoji} WanderDay
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              {veniceDayPlan.title} · {veniceDayPlan.city}
            </p>
          </div>
          <button
            onClick={() => itinerary.setKidMode(!itinerary.kidMode)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              itinerary.kidMode
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Kid Mode
          </button>
        </div>

        <ProgressBar progress={itinerary.progress} />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            <Footprints className="inline h-3.5 w-3.5 mr-1" />
            {itinerary.remainingWalkingTime} min walking left
          </span>
          <span className="text-xs text-muted-foreground">
            {itinerary.currentStopIndex + 1} of {itinerary.totalStops} stops
          </span>
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex gap-2 px-4 py-3">
        <button
          onClick={() => setTab("next")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors ${
            tab === "next"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Map className="h-4 w-4" />
          Next Stop
        </button>
        <button
          onClick={() => setTab("list")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors ${
            tab === "list"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <List className="h-4 w-4" />
          All Stops
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === "next" ? (
            <motion.div
              key="next"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <NextStopView
                currentStop={itinerary.currentStop}
                nextStop={itinerary.nextStop}
                kidMode={itinerary.kidMode}
                isLastStop={itinerary.isLastStop}
                onArrive={itinerary.arrive}
                onSkip={itinerary.skip}
                currentIndex={itinerary.currentStopIndex}
                totalStops={itinerary.totalStops}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <StopList
                stops={veniceDayPlan.stops}
                currentIndex={itinerary.currentStopIndex}
                completedStops={itinerary.completedStops}
                kidMode={itinerary.kidMode}
                onSelectStop={(i) => {
                  itinerary.goToStop(i);
                  setTab("next");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
