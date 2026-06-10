import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { MagnoliaLogo } from "@/components/magnolia/Logo";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Magnolia OS" },
      { name: "description", content: "Sign in to your Magnolia Account." },
    ],
  }),
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app/assistant" });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/app/assistant" },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app/assistant" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/app/assistant",
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app/assistant" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6">
      <div className="absolute inset-0 bg-magnolia-radial opacity-60" aria-hidden />
      <Toaster />
      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-10 flex items-center justify-center gap-2.5">
          <MagnoliaLogo className="h-8 w-8" />
          <span className="font-display text-xl tracking-tight">Magnolia OS</span>
        </Link>
        <div className="rounded-2xl border border-hairline bg-surface/80 p-8 backdrop-blur-xl">
          <h1 className="font-display text-2xl tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your Magnolia Account unlocks the whole ecosystem.
          </p>

          <button
            onClick={handleGoogle}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-hairline bg-background/60 px-4 py-2.5 text-sm font-medium hover:bg-surface-elevated"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-hairline" /> or <div className="h-px flex-1 bg-hairline" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-hairline bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-magnolia"
            />
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-hairline bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-magnolia"
            />
            <button
              type="submit" disabled={loading}
              className="w-full rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-foreground underline-offset-2 hover:underline">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.1 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.2-4.8 9.2-7.3 0-.5-.1-.9-.1-1.3H12z"/>
    </svg>
  );
}
