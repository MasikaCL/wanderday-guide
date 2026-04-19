import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, LogOut, MoreHorizontal, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdventures, useAuthSession } from "@/hooks/useAdventures";
import { ShapeAvatar } from "@/components/ShapeAvatar";
import { CreateAdventureSheet } from "@/components/CreateAdventureSheet";
import { toast } from "sonner";
import { useEffect } from "react";
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
  const { adventures, loading, create, remove } = useAdventures();
  const [createOpen, setCreateOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

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
    setMenuFor(null);
    toast("Adventure deleted");
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 pt-6 pb-24">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShapeAvatar variant="pink" size={48} />
          <div>
            <h1 className="font-display text-2xl leading-none">WanderDay</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your family adventures</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="rounded-full p-2.5 bg-card shadow-sticker border-0" title="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center mt-12">Loading…</p>
      ) : adventures.length === 0 ? (
        <div className="sticker p-8 text-center">
          <ShapeAvatar variant="yellow" size={88} className="mx-auto mb-3" />
          <h2 className="font-display text-lg mb-1">No adventures yet</h2>
          <p className="text-sm text-muted-foreground mb-4">Tap "New adventure" to start planning.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {adventures.map((a, i) => {
            const Character = characters[i % characters.length];
            return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="sticker p-4 flex items-center gap-4 relative"
            >
              <div className="w-12 h-12 shrink-0">
                <Character className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg leading-tight truncate">{a.name}</h3>
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
                onClick={() => setMenuFor(menuFor === a.id ? null : a.id)}
                className="absolute top-3 right-3 rounded-full p-1.5 bg-secondary border-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuFor === a.id && (
                <div className="absolute top-12 right-3 z-10 rounded-[20px] bg-card shadow-sticker p-2 flex flex-col gap-1 min-w-[140px]">
                  <button
                    onClick={() => handleDelete(a.id, a.name)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive rounded-full hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </motion.div>
          )})}
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
    </div>
  );
}
