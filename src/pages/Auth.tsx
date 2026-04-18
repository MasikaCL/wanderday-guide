import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShapeAvatar } from "@/components/ShapeAvatar";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast("Account created! Welcome to WanderDay 🎉");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <ShapeAvatar variant="pink" size={64} />
        <ShapeAvatar variant="yellow" size={56} className="-ml-4 mt-3" />
        <ShapeAvatar variant="green" size={60} className="-ml-4" />
      </div>
      <h1 className="font-display text-4xl text-center mt-2">WanderDay</h1>
      <p className="text-sm font-bold text-foreground/70 text-center mt-1 mb-8">
        Your family adventures, one stop at a time.
      </p>

      <form onSubmit={submit} className="w-full sticker rounded-3xl bg-card p-6 flex flex-col gap-4">
        <h2 className="font-display text-xl">
          {mode === "signin" ? "👋 Welcome back" : "🎒 Start your adventure"}
        </h2>

        <label className="block">
          <span className="label-caps text-foreground/70">Email</span>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full sticker bg-background px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="block">
          <span className="label-caps text-foreground/70">Password</span>
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="mt-1 w-full sticker bg-background px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={busy}
          type="submit"
          className="sticker-btn bg-primary text-primary-foreground py-4 text-base font-display tilt-left disabled:opacity-50"
        >
          {busy ? "..." : mode === "signin" ? "Sign In" : "Create Account"}
        </motion.button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-xs font-extrabold text-secondary underline-offset-2 hover:underline"
        >
          {mode === "signin" ? "No account? Sign up →" : "Already have an account? Sign in →"}
        </button>
      </form>
    </div>
  );
}
