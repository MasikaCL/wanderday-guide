import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface RemoveConfirmProps {
  open: boolean;
  stopName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RemoveConfirm({ open, stopName, onConfirm, onCancel }: RemoveConfirmProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-x-6 top-1/3 z-50 sticker rounded-3xl bg-card p-6 mx-auto max-w-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive border-[2.5px] border-foreground">
                <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
              </div>
              <h3 className="font-display text-lg">Remove stop?</h3>
            </div>
            <p className="text-sm font-bold text-foreground/70 mb-5">
              Remove <strong>{stopName}</strong>? Walking times will be recalculated.
            </p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 sticker-btn bg-card py-3 text-sm">
                Keep it
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="flex-1 sticker-btn bg-destructive text-destructive-foreground py-3 text-sm"
              >
                Remove
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
