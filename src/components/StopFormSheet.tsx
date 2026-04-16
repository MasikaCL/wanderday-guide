import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stop, StopCategory, StopTag, CATEGORY_OPTIONS, ALL_TAGS, CATEGORY_EMOJI } from "@/data/types";
import { X, Plus, ChevronDown } from "lucide-react";

interface StopFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (stop: Stop, position: "end" | "after-current") => void;
  editStop?: Stop | null; // If provided, we're editing
  onUpdate?: (id: string, updates: Partial<Stop>) => void;
}

export function StopFormSheet({ open, onClose, onSubmit, editStop, onUpdate }: StopFormSheetProps) {
  const isEditing = !!editStop;
  const [name, setName] = useState(editStop?.name ?? "");
  const [category, setCategory] = useState<StopCategory>(editStop?.category ?? "sight");
  const [duration, setDuration] = useState(editStop?.duration?.toString() ?? "");
  const [notes, setNotes] = useState(editStop?.notes ?? "");
  const [tags, setTags] = useState<StopTag[]>((editStop?.tags as StopTag[]) ?? []);
  const [position, setPosition] = useState<"end" | "after-current">("after-current");

  const toggleTag = (tag: StopTag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (isEditing && onUpdate && editStop) {
      onUpdate(editStop.id, {
        name: name.trim(),
        category,
        duration: duration ? parseInt(duration) : undefined,
        notes: notes.trim() || undefined,
        tags,
        emoji: CATEGORY_EMOJI[category],
      });
      onClose();
      return;
    }

    const stop: Stop = {
      id: Date.now().toString(),
      name: name.trim(),
      category,
      duration: duration ? parseInt(duration) : undefined,
      notes: notes.trim() || undefined,
      tags,
      emoji: CATEGORY_EMOJI[category],
    };
    onSubmit(stop, position);
    onClose();
  };

  // Reset form when opening
  const resetAndClose = () => {
    setName(editStop?.name ?? "");
    setCategory(editStop?.category ?? "sight");
    setDuration(editStop?.duration?.toString() ?? "");
    setNotes(editStop?.notes ?? "");
    setTags((editStop?.tags as StopTag[]) ?? []);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-card shadow-2xl safe-bottom"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            <div className="px-5 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-black text-lg">
                  {isEditing ? "✏️ Edit Stop" : "➕ Add Stop"}
                </h2>
                <button onClick={resetAndClose} className="rounded-full p-2 bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Name */}
              <label className="block mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ponte dei Sospiri"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              {/* Category */}
              <div className="mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Category</span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCategory(opt.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-xs font-bold transition-all ${
                        category === opt.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                      }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <label className="block mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Duration (minutes, optional)
                </span>
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 30"
                  inputMode="numeric"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              {/* Notes */}
              <label className="block mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kid-friendly tips, avoid crowds, etc."
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              {/* Tags */}
              <div className="mb-5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tags</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ALL_TAGS.map((tag) => (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        tags.includes(tag.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tag.emoji} {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position (only for add) */}
              {!isEditing && (
                <div className="mb-5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Insert where?</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => setPosition("after-current")}
                      className={`rounded-xl border-2 p-3 text-xs font-bold transition-all ${
                        position === "after-current"
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                    >
                      📍 After current stop
                    </button>
                    <button
                      onClick={() => setPosition("end")}
                      className={`rounded-xl border-2 p-3 text-xs font-bold transition-all ${
                        position === "end"
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                    >
                      📋 End of day
                    </button>
                  </div>
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="w-full rounded-xl bg-primary text-primary-foreground py-4 text-base font-display font-bold shadow-lg disabled:opacity-40 transition-opacity"
              >
                {isEditing ? "Save Changes" : "Add to Itinerary"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
