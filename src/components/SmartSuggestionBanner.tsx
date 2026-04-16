import { motion, AnimatePresence } from "framer-motion";
import { SmartSuggestion } from "@/hooks/useItinerary";
import { Lightbulb, X } from "lucide-react";

interface SmartSuggestionBannerProps {
  suggestion: SmartSuggestion | null;
  onDismiss: () => void;
}

export function SmartSuggestionBanner({ suggestion, onDismiss }: SmartSuggestionBannerProps) {
  return (
    <AnimatePresence>
      {suggestion && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mx-4 mb-2 rounded-xl border border-warning/30 bg-warning/10 p-3 flex items-start gap-3"
        >
          <Lightbulb className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <p className="text-xs font-medium text-foreground flex-1">{suggestion.message}</p>
          <button onClick={onDismiss} className="shrink-0 rounded-full p-1 bg-muted/50">
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
