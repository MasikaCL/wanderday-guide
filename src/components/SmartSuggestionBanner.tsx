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
          className="mx-4 mb-2 rounded-[20px] bg-[#FFF3E8] shadow-sticker p-3 flex items-start gap-3"
        >
          <Lightbulb className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-foreground flex-1">{suggestion.message}</p>
          <button onClick={onDismiss} className="shrink-0 rounded-full p-1 bg-secondary border-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
