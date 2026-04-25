import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import type { Folder } from "@/data/types";

interface Props {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
  currentFolderId: string | null | undefined;
  onPick: (folderId: string | null) => Promise<void> | void;
}

export function MoveToFolderSheet({ open, onClose, folders, currentFolderId, onPick }: Props) {
  const handle = async (id: string | null) => {
    await onPick(id);
    onClose();
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
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-[20px] bg-card safe-bottom shadow-sticker"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-foreground/30" />
            </div>
            <div className="px-5 pb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl">Move to folder</h2>
                <button onClick={onClose} className="rounded-full p-2 bg-secondary border-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handle(null)}
                  className="flex items-center justify-between bg-secondary rounded-2xl px-4 py-3 text-left border-0"
                >
                  <span className="text-sm font-medium">📭 No folder</span>
                  {(!currentFolderId) && <Check className="h-4 w-4 text-primary" />}
                </button>
                {folders.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    No folders yet — create one from the dashboard.
                  </p>
                ) : folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handle(f.id)}
                    className="flex items-center justify-between bg-secondary rounded-2xl px-4 py-3 text-left border-0"
                  >
                    <span className="text-sm font-medium">{f.emoji} {f.name}</span>
                    {currentFolderId === f.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
