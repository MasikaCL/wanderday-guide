import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Copy, Trash2, Link as LinkIcon, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Role = "viewer" | "editor";

interface Invite {
  id: string;
  email: string;
  role: Role;
  token: string;
  accepted_at: string | null;
  created_at: string;
}

interface Collaborator {
  id: string;
  user_id: string;
  role: Role | "owner";
  created_at: string;
}

interface ShareAdventureSheetProps {
  open: boolean;
  onClose: () => void;
  adventureId: string;
  adventureName: string;
}

export function ShareAdventureSheet({ open, onClose, adventureId, adventureName }: ShareAdventureSheetProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [submitting, setSubmitting] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [collabs, setCollabs] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [{ data: i }, { data: c }] = await Promise.all([
      supabase
        .from("adventure_invitations")
        .select("id,email,role,token,accepted_at,created_at")
        .eq("adventure_id", adventureId)
        .order("created_at", { ascending: false }),
      supabase
        .from("adventure_collaborators")
        .select("id,user_id,role,created_at")
        .eq("adventure_id", adventureId)
        .order("created_at", { ascending: false }),
    ]);
    setInvites((i ?? []) as Invite[]);
    setCollabs((c ?? []) as Collaborator[]);
    setLoading(false);
  }, [adventureId]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const inviteUrl = (token: string) =>
    `${window.location.origin}/invite/${token}`;

  const handleInvite = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You need to be signed in.");
      setSubmitting(false);
      return;
    }
    const { data, error } = await supabase
      .from("adventure_invitations")
      .insert({ adventure_id: adventureId, email: trimmed, role, invited_by: user.id })
      .select("token")
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not create invite");
      return;
    }
    const url = inviteUrl(data.token);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied — send it to " + trimmed);
    } catch {
      toast.success("Invite created");
    }
    setEmail("");
    refresh();
  };

  const copyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl(token));
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const revokeInvite = async (id: string) => {
    const { error } = await supabase.from("adventure_invitations").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
  };

  const removeCollaborator = async (id: string) => {
    const { error } = await supabase.from("adventure_collaborators").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
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
              <div className="flex items-center justify-between mb-4">
                <div className="min-w-0">
                  <h2 className="font-display text-xl">Share adventure</h2>
                  <p className="text-xs text-muted-foreground truncate">{adventureName}</p>
                </div>
                <button onClick={onClose} className="rounded-full p-2 bg-secondary border-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-[20px] bg-secondary p-3 mb-5">
                <span className="label-caps text-foreground/70">Invite by email</span>
                <div className="flex gap-2 mt-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="flex-1 bg-card px-4 py-3 rounded-[20px] text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setRole("viewer")}
                    className={`rounded-full py-2.5 text-xs font-medium border-0 ${role === "viewer" ? "bg-primary text-primary-foreground" : "bg-card"}`}
                  >
                    Viewer
                  </button>
                  <button
                    onClick={() => setRole("editor")}
                    className={`rounded-full py-2.5 text-xs font-medium border-0 ${role === "editor" ? "bg-primary text-primary-foreground" : "bg-card"}`}
                  >
                    Editor
                  </button>
                </div>
                <button
                  onClick={handleInvite}
                  disabled={submitting || !email.trim()}
                  className="mt-3 w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-display flex items-center justify-center gap-2 disabled:opacity-40 border-0"
                >
                  <Mail className="h-4 w-4" /> Create invite link
                </button>
                <p className="text-[11px] text-muted-foreground mt-2">
                  We'll generate a secret invite link you can paste into any messenger.
                </p>
              </div>

              <div className="mb-5">
                <span className="label-caps text-foreground/70">Pending invites</span>
                <div className="mt-2 flex flex-col gap-2">
                  {loading ? (
                    <p className="text-xs text-muted-foreground">Loading…</p>
                  ) : invites.filter(i => !i.accepted_at).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No pending invites.</p>
                  ) : (
                    invites.filter(i => !i.accepted_at).map((inv) => (
                      <div key={inv.id} className="rounded-[16px] bg-secondary p-3 flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{inv.email}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{inv.role}</p>
                        </div>
                        <button
                          onClick={() => copyLink(inv.token)}
                          className="rounded-full p-2 bg-card border-0"
                          aria-label="Copy invite link"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => revokeInvite(inv.id)}
                          className="rounded-full p-2 bg-card text-destructive border-0"
                          aria-label="Revoke invite"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mb-2">
                <span className="label-caps text-foreground/70">People with access</span>
                <div className="mt-2 flex flex-col gap-2">
                  {collabs.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Just you for now.</p>
                  ) : (
                    collabs.map((c) => (
                      <div key={c.id} className="rounded-[16px] bg-secondary p-3 flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#7ECEC4]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">Collaborator</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{c.role}</p>
                        </div>
                        <button
                          onClick={() => removeCollaborator(c.id)}
                          className="rounded-full p-2 bg-card text-destructive border-0"
                          aria-label="Remove collaborator"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}