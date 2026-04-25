import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";

const EMOJIS = ["🇮🇹","🗺","✈️","🏖","🏔","🎒","🚂","🚢","🏛","🌿","🎡","🍕"];

interface Props {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  initialEmoji?: string;
  title?: string;
  submitLabel?: string;
  onSubmit: (input: { name: string; emoji: string }) => Promise<void>;
}

export function NewFolderSheet({
  open, onClose, onSubmit,
  initialName = "", initialEmoji = "🗺",
  title = "New folder", submitLabel = "Create Folder",
}: Props) {
  const [name, setName] = useState(initialName);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) { setName(initialName); setEmoji(initialEmoji); }
  }, [open, initialName, initialEmoji]);

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), emoji });
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Something went wrong");
    } finally { setBusy(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm" />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-[20px] bg-card safe-bottom shadow-sticker"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-foreground/30" />
            </div>
            <div className="px-5 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl">{title}</h2>
                <button onClick={onClose} className="rounded-full p-2 bg-secondary border-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className="block mb-4">
                <span className="label-caps text-foreground/70">Folder name</span>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Italy trip"
                  className="mt-1 w-full bg-secondary px-4 py-3 rounded-[20px] text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </label>

              <div className="mb-5">
                <span className="label-caps text-foreground/70">Pick an emoji</span>
                <div className="mt-2 grid grid-cols-6 gap-2">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className={`aspect-square rounded-2xl text-2xl flex items-center justify-center border-2 transition ${emoji === e ? "bg-primary/15 border-primary" : "bg-secondary border-transparent"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={submit}
                disabled={busy || !name.trim()}
                className="w-full rounded-full bg-primary text-primary-foreground py-4 text-base font-display disabled:opacity-40 border-0"
              >
                {busy ? "Saving..." : submitLabel}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
