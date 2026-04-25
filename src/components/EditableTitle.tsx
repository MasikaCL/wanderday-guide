import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";

interface Props {
  value: string;
  onSave: (next: string) => void | Promise<void>;
  className?: string;
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

export function EditableTitle({ value, onSave, className = "", editing: editingProp, onEditingChange }: Props) {
  const [internalEditing, setInternalEditing] = useState(false);
  const editing = editingProp ?? internalEditing;
  const setEditing = (v: boolean) => {
    onEditingChange?.(v);
    if (editingProp === undefined) setInternalEditing(v);
  };
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => { ref.current?.focus(); ref.current?.select(); });
    }
  }, [editing]);

  const commit = async () => {
    const next = draft.trim();
    if (next && next !== value) await onSave(next);
    else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        className={`w-full bg-transparent border-b-2 border-[#E8E2DA] focus:border-primary focus:outline-none ${className}`}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group inline-flex items-center gap-1.5 text-left max-w-full bg-transparent border-0 p-0"
    >
      <span className={`truncate ${className}`}>{value}</span>
      <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60 shrink-0" />
    </button>
  );
}
