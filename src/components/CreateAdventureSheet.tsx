import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SHAPE_VARIANTS } from "@/data/types";
import { ShapeAvatar } from "./ShapeAvatar";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { name: string; city: string; date: string; shapeVariant: "pink"|"green"|"yellow" }) => Promise<void>;
}

export function CreateAdventureSheet({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [shape, setShape] = useState<"pink"|"green"|"yellow">("pink");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || !city.trim()) return;
    setBusy(true);
    try {
      await onCreate({ name: name.trim(), city: city.trim(), date, shapeVariant: shape });
      setName(""); setCity("");
      onClose();
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
                <h2 className="font-display text-xl">New adventure</h2>
                <button onClick={onClose} className="rounded-full p-2 bg-secondary border-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className="block mb-4">
                <span className="label-caps text-foreground/70">Trip name</span>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rome with the kids"
                  className="mt-1 w-full bg-secondary px-4 py-3 rounded-[20px] text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </label>

              <label className="block mb-4">
                <span className="label-caps text-foreground/70">City</span>
                <input value={city} onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Rome"
                  className="mt-1 w-full bg-secondary px-4 py-3 rounded-[20px] text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </label>

              <label className="block mb-4">
                <span className="label-caps text-foreground/70">Date</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full bg-secondary px-4 py-3 rounded-[20px] text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </label>

              <div className="mb-5">
                <span className="label-caps text-foreground/70">Pick a shape character</span>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {SHAPE_VARIANTS.map((v) => (
                    <button key={v} onClick={() => setShape(v)}
                      className={`rounded-[20px] p-3 flex items-center justify-center transition-all border-0 shadow-sticker ${
                        shape === v ? "bg-[#FFE8E8]" : "bg-secondary"
                      }`}
                    >
                      <ShapeAvatar variant={v} size={64} />
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={submit}
                disabled={busy || !name.trim() || !city.trim()}
                className="w-full rounded-full bg-primary text-primary-foreground py-4 text-base font-display disabled:opacity-40 border-0"
              >
                {busy ? "Creating..." : "Create Adventure"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
