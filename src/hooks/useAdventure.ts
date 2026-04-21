import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { stopFromRow } from "./useAdventures";
import type { Adventure, Stop } from "@/data/types";
import { ANCHOR_STOPS } from "@/data/types";

export interface SmartSuggestion {
  type: "alternative" | "dense";
  message: string;
  stopId?: string;
}

const estimateWalkingTime = () => Math.floor(Math.random() * 12) + 3;

export function useAdventure(adventureId: string | undefined) {
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState<SmartSuggestion | null>(null);

  const refresh = useCallback(async () => {
    if (!adventureId) return;
    const [{ data: a }, { data: s }] = await Promise.all([
      supabase.from("adventures").select("*").eq("id", adventureId).maybeSingle(),
      supabase.from("stops").select("*").eq("adventure_id", adventureId).order("order_index"),
    ]);
    if (a) {
      setAdventure({
        id: a.id, name: a.name, city: a.city, date: a.date ?? undefined,
        coverEmoji: a.cover_emoji,
        shapeVariant: (["pink","green","yellow"].includes(a.shape_variant) ? a.shape_variant : "pink") as Adventure["shapeVariant"],
        currentStopIndex: a.current_stop_index, kidMode: a.kid_mode,
      });
    }
    if (s) setStops(s.map(stopFromRow));
    setLoading(false);
  }, [adventureId]);

  useEffect(() => { refresh(); }, [refresh]);

  const currentStopIndex = adventure?.currentStopIndex ?? 0;
  const currentStop = stops[currentStopIndex];
  const nextStop = stops[currentStopIndex + 1] ?? null;
  const isLastStop = currentStopIndex === stops.length - 1;
  const progress = stops.length > 1 ? (currentStopIndex / (stops.length - 1)) * 100 : 0;
  const remainingWalkingTime = stops.slice(currentStopIndex).reduce((sum, s) => sum + (s.walkingTimeToNext ?? 0), 0);
  const completedStops = new Set(stops.slice(0, currentStopIndex).map((s) => s.id));

  const setIndex = useCallback(async (i: number) => {
    if (!adventureId) return;
    setAdventure((prev) => prev ? { ...prev, currentStopIndex: i } : prev);
    await supabase.from("adventures").update({ current_stop_index: i }).eq("id", adventureId);
  }, [adventureId]);

  const arrive = useCallback(() => {
    if (currentStopIndex < stops.length - 1) setIndex(currentStopIndex + 1);
  }, [currentStopIndex, stops.length, setIndex]);

  const skip = arrive;
  const goToStop = setIndex;

  const setKidMode = useCallback(async (km: boolean) => {
    if (!adventureId) return;
    setAdventure((p) => p ? { ...p, kidMode: km } : p);
    await supabase.from("adventures").update({ kid_mode: km }).eq("id", adventureId);
  }, [adventureId]);

  const recalcWalkingTimes = async (advId: string) => {
    const { data } = await supabase.from("stops").select("id").eq("adventure_id", advId).order("order_index");
    if (!data) return;
    await Promise.all(data.map((row, i) =>
      supabase.from("stops").update({
        walking_time_to_next: i < data.length - 1 ? estimateWalkingTime() : null,
      }).eq("id", row.id)
    ));
  };

  const reindex = async (advId: string) => {
    const { data } = await supabase.from("stops").select("id").eq("adventure_id", advId).order("order_index");
    if (!data) return;
    await Promise.all(data.map((row, i) =>
      supabase.from("stops").update({ order_index: i }).eq("id", row.id)
    ));
  };

  const addStop = useCallback(async (newStop: Stop, position: "end" | "after-current") => {
    if (!adventureId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const insertOrder = position === "end" ? stops.length : currentStopIndex + 1;
    if (position === "after-current") {
      await Promise.all(stops.slice(insertOrder).map((s, i) =>
        supabase.from("stops").update({ order_index: insertOrder + i + 1 }).eq("id", s.id)
      ));
    }
    await supabase.from("stops").insert({
      adventure_id: adventureId, user_id: user.id, order_index: insertOrder,
      name: newStop.name, category: newStop.category,
      duration: newStop.duration ?? null, notes: newStop.notes ?? null,
      kid_description: newStop.kidDescription ?? null,
      address: newStop.address ?? null, lat: newStop.lat ?? null, lng: newStop.lng ?? null,
      google_maps_url: newStop.googleMapsUrl ?? null,
      tags: newStop.tags ?? [], emoji: newStop.emoji,
      start_time: newStop.startTime ?? null,
      facts: newStop.facts ?? [],
      spot_it: newStop.spotIt ?? null,
    });
    await recalcWalkingTimes(adventureId);
    await refresh();
    if (stops.length + 1 > 12) {
      setSuggestion({ type: "dense", message: "This day has many stops close together. Consider removing one for a calmer pace. 🧘" });
    }
  }, [adventureId, stops, currentStopIndex, refresh]);

  const editStop = useCallback(async (id: string, updates: Partial<Stop>) => {
    await supabase.from("stops").update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.duration !== undefined && { duration: updates.duration ?? null }),
      ...(updates.notes !== undefined && { notes: updates.notes ?? null }),
      ...(updates.kidDescription !== undefined && { kid_description: updates.kidDescription ?? null }),
      ...(updates.address !== undefined && { address: updates.address ?? null }),
      ...(updates.lat !== undefined && { lat: updates.lat ?? null }),
      ...(updates.lng !== undefined && { lng: updates.lng ?? null }),
      ...(updates.googleMapsUrl !== undefined && { google_maps_url: updates.googleMapsUrl ?? null }),
      ...(updates.tags !== undefined && { tags: updates.tags ?? [] }),
      ...(updates.emoji !== undefined && { emoji: updates.emoji }),
      ...(updates.startTime !== undefined && { start_time: updates.startTime ?? null }),
      ...(updates.facts !== undefined && { facts: updates.facts ?? [] }),
      ...(updates.spotIt !== undefined && { spot_it: updates.spotIt ?? null }),
    }).eq("id", id);
    await refresh();
  }, [refresh]);

  const removeStop = useCallback(async (id: string) => {
    if (!adventureId) return;
    const stop = stops.find((s) => s.id === id);
    if (!stop) return;
    if (ANCHOR_STOPS.includes(stop.name)) {
      setSuggestion({
        type: "alternative",
        message: `You removed "${stop.name}". Want a nearby alternative stop? You can add one from the Add Stop menu.`,
        stopId: id,
      });
    }
    await supabase.from("stops").delete().eq("id", id);
    await reindex(adventureId);
    await recalcWalkingTimes(adventureId);
    const idx = stops.findIndex((s) => s.id === id);
    if (idx <= currentStopIndex && currentStopIndex > 0) {
      await setIndex(Math.max(0, currentStopIndex - 1));
    }
    await refresh();
  }, [adventureId, stops, currentStopIndex, setIndex, refresh]);

  const reorderStops = useCallback(async (fromIndex: number, toIndex: number) => {
    if (!adventureId) return;
    const updated = [...stops];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    await Promise.all(updated.map((s, i) =>
      supabase.from("stops").update({ order_index: i }).eq("id", s.id)
    ));
    await recalcWalkingTimes(adventureId);
    await refresh();
  }, [adventureId, stops, refresh]);

  const dismissSuggestion = useCallback(() => setSuggestion(null), []);

  return {
    adventure, stops, loading,
    currentStop, nextStop, currentStopIndex, isLastStop, progress,
    kidMode: adventure?.kidMode ?? true, setKidMode,
    completedStops,
    arrive, skip, goToStop,
    addStop, editStop, removeStop, reorderStops,
    remainingWalkingTime, totalStops: stops.length,
    suggestion, dismissSuggestion,
  };
}
