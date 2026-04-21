import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAdventures";
import { toast } from "sonner";

interface InviteInfo {
  adventure_id: string;
  email: string;
  role: "viewer" | "editor" | "owner";
  accepted_at: string | null;
  adventure_name: string;
  adventure_city: string;
}

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthSession();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error } = await supabase.rpc("get_invitation_by_token", { _token: token });
      if (error) {
        setError(error.message);
      } else if (!data || (Array.isArray(data) && data.length === 0)) {
        setError("Invitation not found.");
      } else {
        const row = Array.isArray(data) ? data[0] : data;
        setInvite(row as InviteInfo);
      }
      setLoading(false);
    })();
  }, [token]);

  const accept = async () => {
    if (!token) return;
    if (!user) {
      navigate(`/auth?redirect=/invite/${token}`);
      return;
    }
    setWorking(true);
    const { data, error } = await supabase.rpc("accept_adventure_invitation", { _token: token });
    setWorking(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("You're in!");
    navigate(`/adventure/${data}`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading invitation…
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-3">
        <h1 className="font-display text-2xl">Invitation unavailable</h1>
        <p className="text-sm text-muted-foreground max-w-sm">{error ?? "This invite link is invalid or has expired."}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-3 rounded-full bg-primary text-primary-foreground py-3 px-6 text-sm font-display border-0"
        >
          Go home
        </button>
      </div>
    );
  }

  if (invite.accepted_at) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-3">
        <h1 className="font-display text-2xl">Invite already used</h1>
        <p className="text-sm text-muted-foreground">
          This invitation has already been accepted. Ask the owner for a fresh one.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-3 rounded-full bg-primary text-primary-foreground py-3 px-6 text-sm font-display border-0"
        >
          Go home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4 max-w-md mx-auto">
      <span className="text-5xl">🎒</span>
      <h1 className="font-display text-2xl">You're invited!</h1>
      <p className="text-sm text-muted-foreground">
        Join <span className="font-semibold text-foreground">{invite.adventure_name}</span>
        {invite.adventure_city ? ` in ${invite.adventure_city}` : ""} as a{" "}
        <span className="font-semibold capitalize text-foreground">{invite.role}</span>.
      </p>
      {!user && (
        <p className="text-xs text-muted-foreground">
          You'll be asked to sign in or create an account first.
        </p>
      )}
      <button
        onClick={accept}
        disabled={working}
        className="mt-2 w-full rounded-full bg-primary text-primary-foreground py-4 text-base font-display disabled:opacity-50 border-0"
      >
        {working ? "Joining…" : user ? "Accept invite" : "Sign in & accept"}
      </button>
      <button
        onClick={() => navigate("/")}
        className="text-xs text-muted-foreground border-0 bg-transparent"
      >
        Maybe later
      </button>
    </div>
  );
}