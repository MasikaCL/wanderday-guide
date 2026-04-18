import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stop, StopCategory, StopTag, CATEGORY_OPTIONS, ALL_TAGS, CATEGORY_EMOJI } from "@/data/types";
import { X, MapPin } from "lucide-react";

interface StopFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (stop: Stop, position: "end" | "after-current") => void;
  editStop?: Stop | null;
  onUpdate?: (id: string, updates: Partial<Stop>) => void;
}

export function StopFormSheet({ open, onClose, onSubmit, editStop, onUpdate }: StopFormSheetProps) {
  const isEditing = !!editStop;
  const [name, setName] = useState(editStop?.name ?? "");
  const [category, setCategory] = useState<StopCategory>(editStop?.category ?? "sight");
  const [duration, setDuration] = useState(editStop?.duration?.toString() ?? "");
  const [notes, setNotes] = useState(editStop?.notes ?? "");
  const [address, setAddress] = useState(editStop?.address ?? "");
  const [tags, setTags] = useState<StopTag[]>((editStop?.tags as StopTag[]) ?? []);
  const [position, setPosition] = useState<"end" | "after-current">("after-current");

  const toggleTag = (tag: StopTag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const pickOnMap = () => {
    if (!address.trim()) return;
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const base: Partial<Stop> = {
      name: name.trim(), category,
      duration: duration ? parseInt(duration) : undefined,
      notes: notes.trim() || undefined,
      address: address.trim() || undefined,
      tags, emoji: CATEGORY_EMOJI[category],
    };

    if (isEditing && onUpdate && editStop) {
      onUpdate(editStop.id, base);
      onClose();
      return;
    }
    const stop: Stop = { id: Date.now().toString(), ...(base as Stop) };
    onSubmit(stop, position);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-[20px] bg-card safe-bottom shadow-sticker"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-foreground/30" />
            </div>

            <div className="px-5 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl">
                  {isEditing ? "Edit stop" : "Add stop"}
                </h2>
                <button onClick={onClose} className="rounded-full p-2 bg-secondary border-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className="block mb-4">
                <span className="label-caps text-foreground/70">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ponte dei Sospiri"
                  className="mt-1 w-full bg-secondary px-4 py-3 rounded-[20px] text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              <div className="mb-4">
                <span className="label-caps text-foreground/70">Category</span>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCategory(opt.value)}
                      className={`rounded-[20px] py-3 px-1 flex flex-col items-center gap-1 transition-all border-0 shadow-sticker ${
                        category === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-[10px] font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="block mb-4">
                <span className="label-caps text-foreground/70">Duration (min)</span>
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 30"
                  inputMode="numeric"
                  className="mt-1 w-full bg-secondary px-4 py-3 rounded-[20px] text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              <label className="block mb-4">
                <span className="label-caps text-foreground/70">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kid-friendly tips, avoid crowds, etc."
                  rows={2}
                  className="mt-1 w-full bg-secondary px-4 py-3 rounded-[20px] text-sm font-medium resize-none border-0 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              {/* Location */}
              <div className="mb-4">
                <span className="label-caps text-foreground/70">Location</span>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address or place name"
                  className="mt-1 w-full bg-secondary px-4 py-3 rounded-[20px] text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={pickOnMap}
                  disabled={!address.trim()}
                  className="mt-2 rounded-full bg-[#E8F4FF] text-[#7FA6CC] py-2.5 px-4 text-xs flex items-center gap-2 disabled:opacity-40 border-0"
                >
                  <MapPin className="h-4 w-4" /> Pick on map
                </button>
              </div>

              <div className="mb-5">
                <span className="label-caps text-foreground/70">Tags</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ALL_TAGS.map((tag) => (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all border-0 ${
                        tags.includes(tag.value)
                          ? "bg-[#F5A7C7] text-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {tag.emoji} {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {!isEditing && (
                <div className="mb-5">
                  <span className="label-caps text-foreground/70">Insert where?</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => setPosition("after-current")}
                      className={`rounded-full py-3 text-xs font-medium border-0 ${
                        position === "after-current" ? "bg-primary text-primary-foreground" : "bg-secondary"
                      }`}
                    >
                      After current
                    </button>
                    <button
                      onClick={() => setPosition("end")}
                      className={`rounded-full py-3 text-xs font-medium border-0 ${
                        position === "end" ? "bg-primary text-primary-foreground" : "bg-secondary"
                      }`}
                    >
                      End of day
                    </button>
                  </div>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="w-full rounded-full bg-primary text-primary-foreground py-4 text-base font-display disabled:opacity-40 border-0"
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
