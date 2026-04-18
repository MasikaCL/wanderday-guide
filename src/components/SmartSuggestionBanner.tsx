import { motion, AnimatePresence } from "framer-motion";
import { SmartSuggestion } from "@/hooks/useAdventure";
import { Lightbulb, X } from "lucide-react";

interface Props {
  suggestion: SmartSuggestion | null;
  onDismiss: () => void;
}

export function SmartSuggestionBanner({ suggestion, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {suggestion && (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          className="mx-4 mb-2 sticker-sm rounded-2xl bg-warning p-3 flex items-start gap-3"
        >
          <Lightbulb className="h-5 w-5 text-warning-foreground mt-0.5 shrink-0" />
          <p className="text-xs font-extrabold text-warning-foreground flex-1">{suggestion.message}</p>
          <button onClick={onDismiss} className="shrink-0 rounded-full p-1 bg-background/60">
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
