import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { X, MapPin, Apple, Copy } from "lucide-react";
import type { Stop } from "@/data/types";

interface Props {
  open: boolean;
  onClose: () => void;
  stop: Stop | null;
}

const buildQuery = (s: Stop) => {
  if (s.lat != null && s.lng != null) return `${s.lat},${s.lng}`;
  return s.address || s.name;
};

export function OpenInMapsSheet({ open, onClose, stop }: Props) {
  if (!stop) return null;
  const q = buildQuery(stop);

  const openGoogle = () => {
    const url = stop.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(q)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };
  const openApple = () => {
    window.open(`https://maps.apple.com/?q=${encodeURIComponent(q)}`, "_blank", "noopener,noreferrer");
    onClose();
  };
  const copy = async () => {
    await navigator.clipboard.writeText(stop.address || q);
    toast("Address copied!", { duration: 1800 });
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
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[20px] bg-card p-5 safe-bottom shadow-sticker"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Open in maps</p>
                <h3 className="font-display text-lg">{stop.name}</h3>
              </div>
              <button onClick={onClose} className="rounded-full p-2 bg-secondary border-0">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={openGoogle} className="rounded-full bg-[#E8F4FF] text-[#7FA6CC] py-4 px-4 flex items-center gap-3 border-0">
                <MapPin className="h-5 w-5" /> Google Maps
              </button>
              <button onClick={openApple} className="rounded-full bg-secondary text-foreground py-4 px-4 flex items-center gap-3 border-0">
                <Apple className="h-5 w-5" /> Apple Maps
              </button>
              <button onClick={copy} className="rounded-full bg-[#F5D06A] text-foreground py-4 px-4 flex items-center gap-3 border-0">
                <Copy className="h-5 w-5" /> Copy address
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
