import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-x-6 top-1/3 z-50 rounded-2xl bg-card p-6 shadow-2xl mx-auto max-w-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="font-display font-bold text-base">Remove stop?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Remove <strong>{stopName}</strong> and reflow route? Walking times will be recalculated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl border-2 border-border py-3 text-sm font-bold text-muted-foreground"
              >
                Keep it
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="flex-1 rounded-xl bg-destructive text-destructive-foreground py-3 text-sm font-bold"
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
