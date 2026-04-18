import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Map, List, Sparkles, Footprints, Plus } from "lucide-react";
import { useAuthSession } from "@/hooks/useAdventures";
import { useAdventure } from "@/hooks/useAdventure";
import { ProgressBar } from "@/components/ProgressBar";
import { NextStopView } from "@/components/NextStopView";
import { StopList } from "@/components/StopList";
import { StopFormSheet } from "@/components/StopFormSheet";
import { RemoveConfirm } from "@/components/RemoveConfirm";
import { SmartSuggestionBanner } from "@/components/SmartSuggestionBanner";
import { ShapeAvatar } from "@/components/ShapeAvatar";
import { Stop } from "@/data/types";

type Tab = "next" | "list";

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
    return <div className="min-h-screen flex items-center justify-center text-sm font-bold text-foreground/60">Loading adventure…</div>;
  }

  const a = itinerary.adventure;

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-lg border-b-[2.5px] border-foreground px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3 gap-2">
          <button
            onClick={() => navigate("/")}
            className="sticker-sm rounded-full p-2 bg-card flex items-center gap-1.5 pr-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-extrabold">Back</span>
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
            <ShapeAvatar variant={a.shapeVariant} size={36} />
            <div className="min-w-0">
              <h1 className="font-display text-base leading-tight truncate">{a.name}</h1>
              <p className="text-[10px] font-extrabold text-foreground/60 truncate">{a.city}</p>
            </div>
          </div>
          <button
            onClick={() => itinerary.setKidMode(!itinerary.kidMode)}
            className={`sticker-sm rounded-full px-3 py-1.5 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider ${
              itinerary.kidMode ? "bg-accent text-accent-foreground" : "bg-card"
            }`}
          >
            <Sparkles className="h-3 w-3" /> Kid
          </button>
        </div>

        <ProgressBar progress={itinerary.progress} />

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] font-extrabold text-foreground/60">
            <Footprints className="inline h-3.5 w-3.5 mr-1" />
            {itinerary.remainingWalkingTime} min left
          </span>
          <span className="text-[11px] font-extrabold text-foreground/60">
            {itinerary.currentStopIndex + 1} of {itinerary.totalStops}
          </span>
        </div>
      </header>

      <SmartSuggestionBanner suggestion={itinerary.suggestion} onDismiss={itinerary.dismissSuggestion} />

      <div className="flex gap-2 px-4 py-3">
        <button
          onClick={() => setTab("next")}
          className={`flex-1 sticker rounded-2xl py-2.5 flex items-center justify-center gap-2 text-sm font-extrabold ${
            tab === "next" ? "bg-primary text-primary-foreground" : "bg-card"
          }`}
        >
          <Map className="h-4 w-4" /> Next Stop
        </button>
        <button
          onClick={() => setTab("list")}
          className={`flex-1 sticker rounded-2xl py-2.5 flex items-center justify-center gap-2 text-sm font-extrabold ${
            tab === "list" ? "bg-primary text-primary-foreground" : "bg-card"
          }`}
        >
          <List className="h-4 w-4" /> All Stops
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
        className="fixed bottom-6 right-6 z-30 sticker-btn bg-accent text-accent-foreground h-14 w-14 rounded-full flex items-center justify-center"
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
