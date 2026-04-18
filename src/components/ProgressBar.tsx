import { motion } from "framer-motion";

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-4 bg-card rounded-full overflow-hidden border-[2.5px] border-foreground shadow-sticker-sm">
      <motion.div
        className="h-full bg-primary rounded-full border-r-[2.5px] border-foreground"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(progress, 4)}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 18 }}
      />
    </div>
  );
}
