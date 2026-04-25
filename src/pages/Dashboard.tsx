import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut, MoreHorizontal, Trash2, Pencil, FolderPlus, ChevronRight, ChevronDown, FolderInput, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdventures, useAuthSession } from "@/hooks/useAdventures";
import { CreateAdventureSheet } from "@/components/CreateAdventureSheet";
import { NewFolderSheet } from "@/components/NewFolderSheet";
import { MoveToFolderSheet } from "@/components/MoveToFolderSheet";
import { EditableTitle } from "@/components/EditableTitle";
import { toast } from "sonner";
import type { Adventure, Folder } from "@/data/types";
import Char1 from "../assets/characters/Frame_1.svg?react";
import Char2 from "../assets/characters/Frame_2.svg?react";
import Char3 from "../assets/characters/Frame_3.svg?react";
import Char4 from "../assets/characters/Frame_4.svg?react";
import Char5 from "../assets/characters/Frame_5.svg?react";
import Char6 from "../assets/characters/Frame_6.svg?react";
import Char7 from "../assets/characters/Frame_7.svg?react";
import Char8 from "../assets/characters/Frame_8.svg?react";
import Char9 from "../assets/characters/Frame_9.svg?react";
import Char10 from "../assets/characters/Frame_10.svg?react";
import Char11 from "../assets/characters/Frame_11.svg?react";
import Char12 from "../assets/characters/Frame_12.svg?react";

const characters = [Char1, Char2, Char3, Char4, Char5, Char6, Char7, Char8, Char9, Char10, Char11, Char12];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthSession();
  const {
    adventures, folders, loading,
    create, remove, rename,
    moveToFolder, createFolder, updateFolder, deleteFolder,
  } = useAdventures();

  const [createOpen, setCreateOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<Adventure | null>(null);
  const [editFolder, setEditFolder] = useState<{ folder: Folder; mode: "rename" | "emoji" } | null>(null);
  const [advMenu, setAdvMenu] = useState<string | null>(null);
  const [folderMenu, setFolderMenu] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string | null>(null);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  const ungrouped = useMemo(
    () => adventures.filter((a) => !a.folderId),
    [adventures]
  );
  const folderMap = useMemo(() => {
    const m: Record<string, Adventure[]> = {};
    folders.forEach((f) => (m[f.id] = []));
    adventures.forEach((a) => { if (a.folderId && m[a.folderId]) m[a.folderId].push(a); });
    return m;
  }, [adventures, folders]);

  const handleCreate = async (input: { name: string; city: string; date: string; shapeVariant: "pink"|"green"|"yellow" }) => {
    await create(input);
    toast("Adventure created");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    await remove(id);
    setAdvMenu(null);
    toast("Adventure deleted");
  };

  const handleDeleteFolder = async (f: Folder) => {
    if (!confirm("Adventures inside will be moved to ungrouped. Are you sure?")) return;
    await deleteFolder(f.id);
    setFolderMenu(null);
    toast("Folder deleted");
  };

  if (authLoading || !user) return null;

  const renderAdventureCard = (a: Adventure, i: number, opts?: { compact?: boolean }) => {
    const Character = characters[i % characters.length];
    const compact = !!opts?.compact;
    return (
      <motion.div
        key={a.id}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
        className={`relative flex items-center gap-4 ${compact
          ? "bg-card rounded-[16px] p-3 border-l-[3px] border-[#B8A9D9]"
          : "sticker p-4"}`}
      >
        <div className={`shrink-0 ${compact ? "w-10 h-10" : "w-12 h-12"}`}>
          <Character className="w-full h-full" />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <h3 className={`font-display leading-tight ${compact ? "text-base" : "text-lg"}`}>
            <EditableTitle
              value={a.name}
              editing={editingName === a.id}
              onEditingChange={(v) => setEditingName(v ? a.id : null)}
              onSave={async (next) => { await rename(a.id, { name: next }); toast("Renamed"); }}
              className="font-display"
            />
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {a.city}{a.date ? ` · ${new Date(a.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}` : ""}
          </p>
          <button
            onClick={() => navigate(`/adventure/${a.id}`)}
            className="mt-3 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs border-0"
          >
            Continue
          </button>
        </div>
        <button
          onClick={() => setAdvMenu(advMenu === a.id ? null : a.id)}
          className="absolute top-3 right-3 rounded-full p-1.5 bg-secondary border-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <AnimatePresence>
          {advMenu === a.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-12 right-3 z-20 rounded-[16px] bg-card shadow-sticker p-1.5 flex flex-col gap-0.5 min-w-[180px]"
            >
              <button
                onClick={() => { setEditingName(a.id); setAdvMenu(null); }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-full hover:bg-secondary text-left"
              >
                <Pencil className="h-3.5 w-3.5" /> Rename
              </button>
              <button
                onClick={() => { setMoveTarget(a); setAdvMenu(null); }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-full hover:bg-secondary text-left"
              >
                <FolderInput className="h-3.5 w-3.5" /> Move to folder →
              </button>
              <button
                onClick={() => handleDelete(a.id, a.name)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive rounded-full hover:bg-destructive/10 text-left"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  let advIdx = 0;

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 pt-6 pb-32" onClick={() => { setAdvMenu(null); setFolderMenu(null); }}>
      <header className="flex items-center justify-between mb-6" onClick={(e) => e.stopPropagation()}>
        <div>
          <h1 className="font-display text-2xl leading-none">WanderDay</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your family adventures</p>
        </div>
        <button onClick={handleSignOut} className="rounded-full p-2.5 bg-card shadow-sticker border-0" title="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center mt-12">Loading…</p>
      ) : (adventures.length === 0 && folders.length === 0) ? (
        <div className="sticker p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <h2 className="font-display text-lg mb-1">No adventures yet</h2>
          <p className="text-sm text-muted-foreground mb-4">Tap "New adventure" to start planning.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
          {/* Folders */}
          {folders.map((f) => {
            const collapsed = collapsedFolders[f.id];
            const items = folderMap[f.id] ?? [];
            return (
              <div key={f.id} className="rounded-[16px] bg-[#F0EBE3] shadow-sticker p-3 relative">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCollapsedFolders((s) => ({ ...s, [f.id]: !s[f.id] }))}
                    className="rounded-full p-1.5 bg-card border-0"
                    aria-label={collapsed ? "Expand" : "Collapse"}
                  >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <span className="text-xl">{f.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-base leading-tight">
                      <EditableTitle
                        value={f.name}
                        editing={editingFolderName === f.id}
                        onEditingChange={(v) => setEditingFolderName(v ? f.id : null)}
                        onSave={async (next) => { await updateFolder(f.id, { name: next }); toast("Folder renamed"); }}
                        className="font-display"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{items.length} adventure{items.length === 1 ? "" : "s"}</p>
                  </div>
                  <button
                    onClick={() => setFolderMenu(folderMenu === f.id ? null : f.id)}
                    className="rounded-full p-1.5 bg-card border-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <AnimatePresence>
                  {folderMenu === f.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute top-12 right-3 z-20 rounded-[16px] bg-card shadow-sticker p-1.5 flex flex-col gap-0.5 min-w-[180px]"
                    >
                      <button
                        onClick={() => { setEditingFolderName(f.id); setFolderMenu(null); }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-full hover:bg-secondary text-left"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Rename folder
                      </button>
                      <button
                        onClick={() => { setEditFolder({ folder: f, mode: "emoji" }); setFolderMenu(null); }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-full hover:bg-secondary text-left"
                      >
                        <Smile className="h-3.5 w-3.5" /> Change emoji
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(f)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive rounded-full hover:bg-destructive/10 text-left"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete folder
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {!collapsed && items.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pt-3 flex flex-col gap-3">
                        {items.map((a) => renderAdventureCard(a, advIdx++, { compact: true }))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Ungrouped */}
          {folders.length > 0 && ungrouped.length > 0 && (
            <p className="label-caps text-foreground/50 mt-2 px-1">Other adventures</p>
          )}
          {ungrouped.map((a) => renderAdventureCard(a, advIdx++))}

          <button
            onClick={() => setNewFolderOpen(true)}
            className="self-start mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium border-2 border-[#9B95A3] text-[#9B95A3] bg-transparent"
          >
            <FolderPlus className="h-4 w-4" /> New Folder
          </button>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 inset-x-4 max-w-lg mx-auto rounded-full bg-primary text-primary-foreground py-4 flex items-center justify-center gap-2 text-base font-display z-30 border-0"
      >
        <Plus className="h-5 w-5" /> New adventure
      </motion.button>

      <CreateAdventureSheet open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />

      <NewFolderSheet
        open={newFolderOpen}
        onClose={() => setNewFolderOpen(false)}
        onSubmit={async (input) => { await createFolder(input); toast("Folder created"); }}
      />

      <NewFolderSheet
        open={!!editFolder}
        onClose={() => setEditFolder(null)}
        title={editFolder?.mode === "emoji" ? "Change emoji" : "Edit folder"}
        submitLabel="Save"
        initialName={editFolder?.folder.name ?? ""}
        initialEmoji={editFolder?.folder.emoji ?? "🗺"}
        onSubmit={async (input) => {
          if (!editFolder) return;
          await updateFolder(editFolder.folder.id, input);
          toast("Folder updated");
        }}
      />

      <MoveToFolderSheet
        open={!!moveTarget}
        onClose={() => setMoveTarget(null)}
        folders={folders}
        currentFolderId={moveTarget?.folderId}
        onPick={async (folderId) => {
          if (!moveTarget) return;
          await moveToFolder(moveTarget.id, folderId);
          toast(folderId ? "Moved to folder" : "Removed from folder");
        }}
      />
    </div>
  );
}
