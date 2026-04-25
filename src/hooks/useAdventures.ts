import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Adventure, Stop, StopCategory, StopTag } from "@/data/types";
import type { User, Session } from "@supabase/supabase-js";

type AdvRow = {
  id: string; name: string; city: string; date: string | null;
  cover_emoji: string; shape_variant: string;
  current_stop_index: number; kid_mode: boolean;
  folder_id: string | null;
};

type StopRow = {
  id: string; adventure_id: string; order_index: number;
  name: string; category: string; duration: number | null;
  notes: string | null; kid_description: string | null;
  walking_time_to_next: number | null;
  address: string | null; lat: number | null; lng: number | null;
  google_maps_url: string | null;
  tags: string[]; emoji: string; completed: boolean;
  start_time?: string | null;
  facts?: string[] | null;
  spot_it?: string | null;
};

const advFromRow = (r: AdvRow): Adventure => ({
  id: r.id, name: r.name, city: r.city, date: r.date ?? undefined,
  coverEmoji: r.cover_emoji,
  shapeVariant: (["pink","green","yellow"].includes(r.shape_variant) ? r.shape_variant : "pink") as Adventure["shapeVariant"],
  currentStopIndex: r.current_stop_index, kidMode: r.kid_mode,
  folderId: r.folder_id ?? null,
});

export const stopFromRow = (r: StopRow): Stop => ({
  id: r.id, name: r.name, category: r.category as StopCategory,
  duration: r.duration ?? undefined, notes: r.notes ?? undefined,
  kidDescription: r.kid_description ?? undefined,
  walkingTimeToNext: r.walking_time_to_next ?? undefined,
  address: r.address ?? undefined, lat: r.lat ?? undefined, lng: r.lng ?? undefined,
  googleMapsUrl: r.google_maps_url ?? undefined,
  tags: r.tags as StopTag[],
  emoji: r.emoji,
  startTime: r.start_time ?? undefined,
  facts: r.facts ?? undefined,
  spotIt: r.spot_it ?? undefined,
});

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setUser(data.session?.user ?? null); setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}

export function useAdventures() {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [advRes, folderRes] = await Promise.all([
      supabase.from("adventures").select("*").order("created_at", { ascending: true }),
      supabase.from("adventure_folders").select("*").order("created_at", { ascending: true }),
    ]);
    if (!advRes.error && advRes.data) setAdventures((advRes.data as AdvRow[]).map(advFromRow));
    if (!folderRes.error && folderRes.data) {
      setFolders((folderRes.data as FolderRow[]).map(folderFromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (input: {
    name: string; city: string; date?: string; coverEmoji?: string;
    shapeVariant?: "pink" | "green" | "yellow"; seedVenice?: boolean;
    folderId?: string | null;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const { data, error } = await supabase.from("adventures").insert({
      user_id: user.id,
      name: input.name, city: input.city,
      date: input.date && input.date.length > 0 ? input.date : null,
      cover_emoji: input.coverEmoji ?? "🗺️",
      shape_variant: input.shapeVariant ?? "pink",
      folder_id: input.folderId ?? null,
    }).select().single();
    if (error || !data) throw error;
    await refresh();
    return data.id as string;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("adventures").delete().eq("id", id);
    await refresh();
  }, [refresh]);

  const rename = useCallback(async (id: string, patch: { name?: string; date?: string; city?: string }) => {
    await supabase.from("adventures").update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.date !== undefined && { date: patch.date }),
      ...(patch.city !== undefined && { city: patch.city }),
    }).eq("id", id);
    await refresh();
  }, [refresh]);

  const moveToFolder = useCallback(async (adventureId: string, folderId: string | null) => {
    await supabase.from("adventures").update({ folder_id: folderId }).eq("id", adventureId);
    await refresh();
  }, [refresh]);

  const createFolder = useCallback(async (input: { name: string; emoji: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const { data, error } = await supabase.from("adventure_folders").insert({
      user_id: user.id, name: input.name, emoji: input.emoji,
    }).select().single();
    if (error || !data) throw error;
    await refresh();
    return data.id as string;
  }, [refresh]);

  const updateFolder = useCallback(async (id: string, patch: { name?: string; emoji?: string }) => {
    await supabase.from("adventure_folders").update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.emoji !== undefined && { emoji: patch.emoji }),
    }).eq("id", id);
    await refresh();
  }, [refresh]);

  const deleteFolder = useCallback(async (id: string) => {
    // Adventures' folder_id will be SET NULL by FK on delete
    await supabase.from("adventure_folders").delete().eq("id", id);
    await refresh();
  }, [refresh]);

  return {
    adventures, folders, loading, refresh,
    create, remove, rename,
    moveToFolder, createFolder, updateFolder, deleteFolder,
  };
}
