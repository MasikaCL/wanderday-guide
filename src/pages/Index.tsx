import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Map, List, Footprints, Plus, MapPin } from "lucide-react";
import { RouteMap } from "@/components/RouteMap";
import { useAuthSession } from "@/hooks/useAdventures";
import { useAdventure } from "@/hooks/useAdventure";
import { ProgressBar } from "@/components/ProgressBar";
import { NextStopView } from "@/components/NextStopView";
import { StopList } from "@/components/StopList";
import { StopFormSheet } from "@/components/StopFormSheet";
import { RemoveConfirm } from "@/components/RemoveConfirm";
import { SmartSuggestionBanner } from "@/components/SmartSuggestionBanner";

import { Stop } from "@/data/types";

type Tab = "next" | "list" | "map";

export default function Index() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthSession();
  const itinerary = useAdventure(id);
  const [tab, setTab] = useState<Tab>("next");
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [removingStop, setRemovingStop] = useState<Stop | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;
  if (itinerary.loading || !itinerary.adventure) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading adventure…</div>;
  }

  const a = itinerary.adventure;

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-lg px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3 gap-2">
          <button
            onClick={() => navigate("/")}
            className="rounded-full p-2 bg-card shadow-sticker flex items-center gap-1.5 pr-3 border-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
            <div className="min-w-0 text-center">
              <h1 className="font-display text-base leading-tight truncate">{a.name}</h1>
              <p className="text-[10px] text-muted-foreground truncate">{a.city}</p>
            </div>
          </div>
        </div>

        <ProgressBar progress={itinerary.progress} />

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-muted-foreground">
            <Footprints className="inline h-3.5 w-3.5 mr-1" />
            {itinerary.remainingWalkingTime} min left
          </span>
          <span className="text-[11px] text-muted-foreground">
            {itinerary.currentStopIndex + 1} of {itinerary.totalStops}
          </span>
        </div>
      </header>

      <SmartSuggestionBanner suggestion={itinerary.suggestion} onDismiss={itinerary.dismissSuggestion} />

      <div className="flex gap-2 px-4 py-3">
        <button
          onClick={() => setTab("next")}
          className={`flex-1 rounded-full py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium border-0 ${
            tab === "next" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          }`}
        >
          <Map className="h-4 w-4" /> Next
        </button>
        <button
          onClick={() => setTab("list")}
          className={`flex-1 rounded-full py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium border-0 ${
            tab === "list" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          }`}
        >
          <List className="h-4 w-4" /> Stops
        </button>
        <button
          onClick={() => setTab("map")}
          className={`flex-1 rounded-full py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium border-0 ${
            tab === "map" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          }`}
        >
          <MapPin className="h-4 w-4" /> Map
        </button>
      </div>

      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === "next" && itinerary.currentStop ? (
            <motion.div key="next"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}>
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
          ) : tab === "map" ? (
            <motion.div key="map"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <RouteMap stops={itinerary.stops} currentIndex={itinerary.currentStopIndex} />
            </motion.div>
          ) : (
            <motion.div key="list"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}>
              <StopList
                stops={itinerary.stops}
                currentIndex={itinerary.currentStopIndex}
                completedStops={itinerary.completedStops}
                kidMode={itinerary.kidMode}
                onSelectStop={(i) => { itinerary.goToStop(i); setTab("next"); }}
                onEditStop={(stop) => setEditingStop(stop)}
                onRemoveStop={(stop) => setRemovingStop(stop)}
                onReorder={itinerary.reorderStops}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setAddSheetOpen(true)}
        className="fixed bottom-6 right-6 z-30 bg-primary text-primary-foreground h-14 w-14 rounded-full flex items-center justify-center border-0"
      >
        <Plus className="h-7 w-7" />
      </motion.button>

      <StopFormSheet
        key="add-sheet"
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSubmit={itinerary.addStop}
      />

      {editingStop && (
        <StopFormSheet
          key={`edit-${editingStop.id}`}
          open={!!editingStop}
          onClose={() => setEditingStop(null)}
          onSubmit={() => {}}
          editStop={editingStop}
          onUpdate={itinerary.editStop}
        />
      )}

      <RemoveConfirm
        open={!!removingStop}
        stopName={removingStop?.name ?? ""}
        onConfirm={() => {
          if (removingStop) itinerary.removeStop(removingStop.id);
          setRemovingStop(null);
        }}
        onCancel={() => setRemovingStop(null)}
      />
    </div>
  );
}
