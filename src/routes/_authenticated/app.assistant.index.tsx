import { createFileRoute, useNavigate, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listThreads, createThread, deleteThread } from "@/lib/assistant.functions";
import { MagnoliaLogo } from "@/components/magnolia/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Plus, MessageSquare, Trash2, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/assistant/")({
  head: () => ({ meta: [{ title: "Assistant — Magnolia OS" }] }),
  component: AssistantIndex,
});

function AssistantIndex() {
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);

  const { data: threads = [], isLoading } = useQuery({ queryKey: ["threads"], queryFn: () => list() });

  // Auto-create or open most recent thread
  useEffect(() => {
    if (isLoading) return;
    if (threads.length === 0) {
      create({ data: {} }).then((t) => navigate({ to: "/app/assistant/$threadId", params: { threadId: t.id } }));
    } else {
      navigate({ to: "/app/assistant/$threadId", params: { threadId: threads[0].id }, replace: true });
    }
  }, [isLoading, threads, create, navigate]);

  return (
    <AssistantShell threads={threads} activeId={null}
      onNew={async () => { const t = await create({ data: {} }); await qc.invalidateQueries({ queryKey: ["threads"] }); navigate({ to: "/app/assistant/$threadId", params: { threadId: t.id } }); }}
      onDelete={async (id) => { await del({ data: { id } }); await qc.invalidateQueries({ queryKey: ["threads"] }); router.invalidate(); }}
    >
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading…</div>
    </AssistantShell>
  );
}

export function AssistantShell({
  threads, activeId, onNew, onDelete, children,
}: {
  threads: Array<{ id: string; title: string }>;
  activeId: string | null;
  onNew: () => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-72 flex-col border-r border-hairline bg-sidebar md:flex">
        <Link to="/" className="flex h-16 items-center gap-2.5 border-b border-hairline px-5">
          <MagnoliaLogo className="h-6 w-6" />
          <span className="font-display text-base tracking-tight">Magnolia</span>
        </Link>
        <div className="p-3">
          <button onClick={onNew} className="flex w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm font-medium hover:bg-surface-elevated">
            <Plus className="h-4 w-4" /> New conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {threads.map((t) => (
            <div key={t.id} className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 ${activeId === t.id ? "bg-surface-elevated" : "hover:bg-surface"}`}>
              <Link to="/app/assistant/$threadId" params={{ threadId: t.id }} className="flex flex-1 items-center gap-2 truncate text-sm">
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.title}</span>
              </Link>
              <button onClick={() => onDelete(t.id)} className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={signOut} className="flex items-center gap-2 border-t border-hairline px-5 py-3 text-xs text-muted-foreground hover:text-foreground">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
