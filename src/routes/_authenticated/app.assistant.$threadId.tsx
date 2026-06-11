import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { listThreads, createThread, deleteThread, getThreadMessages } from "@/lib/assistant.functions";
import { AssistantShell } from "./app.assistant.index";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUp, Sparkles, Square, RefreshCw, X } from "lucide-react";
import { MagnoliaLogo } from "@/components/magnolia/Logo";

export const Route = createFileRoute("/_authenticated/app/assistant/$threadId")({
  head: () => ({ meta: [{ title: "Assistant — Magnolia OS" }] }),
  component: AssistantThread,
});

function AssistantThread() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const getMsgs = useServerFn(getThreadMessages);

  const { data: threads = [] } = useQuery({ queryKey: ["threads"], queryFn: () => list() });
  const { data: initialMessages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => getMsgs({ data: { threadId } }),
  });

  const initialUIMessages: UIMessage[] = useMemo(
    () => initialMessages.map((m) => ({ id: m.id, role: m.role, parts: m.parts as UIMessage["parts"] })),
    [initialMessages],
  );

  return (
    <AssistantShell
      threads={threads}
      activeId={threadId}
      onNew={async () => { const t = await create({ data: {} }); await qc.invalidateQueries({ queryKey: ["threads"] }); navigate({ to: "/app/assistant/$threadId", params: { threadId: t.id } }); }}
      onDelete={async (id) => {
        await del({ data: { id } });
        await qc.invalidateQueries({ queryKey: ["threads"] });
        if (id === threadId) {
          const remaining = threads.filter((t) => t.id !== id);
          if (remaining[0]) navigate({ to: "/app/assistant/$threadId", params: { threadId: remaining[0].id }, replace: true });
          else navigate({ to: "/app/assistant", replace: true });
        }
        router.invalidate();
      }}
    >
      {msgsLoading ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <ChatWindow key={threadId} threadId={threadId} initialMessages={initialUIMessages} onFirstResponse={() => qc.invalidateQueries({ queryKey: ["threads"] })} />
      )}
    </AssistantShell>
  );
}

function ChatWindow({ threadId, initialMessages, onFirstResponse }: { threadId: string; initialMessages: UIMessage[]; onFirstResponse: () => void }) {
  const transport = useMemo(
    () => new DefaultChatTransport({
      api: "/api/chat",
      body: { threadId },
      fetch: async (input, init) => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const headers = new Headers(init?.headers);
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    }),
    [threadId],
  );

  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onFinish: onFirstResponse,
  });

  const [input, setInput] = useState("");
  const [queue, setQueue] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, status]);
  useEffect(() => { textareaRef.current?.focus(); }, [threadId, busy]);

  // Drain the queue when the assistant finishes
  useEffect(() => {
    if (status === "ready" && queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      void sendMessage({ text: next });
    }
  }, [status, queue, sendMessage]);

  async function submit() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    if (busy) {
      setQueue((q) => [...q, text]);
      return;
    }
    await sendMessage({ text });
  }

  function removeFromQueue(idx: number) {
    setQueue((q) => q.filter((_, i) => i !== idx));
  }

  const empty = messages.length === 0;
  const lastIsAssistant = messages[messages.length - 1]?.role === "assistant";
  const canRetry = !busy && lastIsAssistant && messages.length > 0;

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 text-center">
            <MagnoliaLogo className="h-12 w-12" />
            <h1 className="mt-6 font-display text-4xl tracking-tight text-balance">How can Magnolia help today?</h1>
            <p className="mt-3 text-muted-foreground">Ask anything — brainstorm, draft, plan, debug, learn.</p>
            <div className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {["Draft a launch email for a new product", "Explain quantum entanglement simply", "Plan a 3-day trip to Lisbon", "Review this code for issues"].map((s) => (
                <button key={s} onClick={() => setInput(s)} className="rounded-xl border border-hairline bg-surface px-4 py-3 text-left text-sm text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
            {messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-magnolia" /> Thinking…
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error.message || "Something went wrong."}
              </div>
            )}
            {canRetry && (
              <div className="flex justify-center">
                <button onClick={() => regenerate()} className="flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-hairline bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-4">
          {queue.length > 0 && (
            <div className="mb-2 space-y-1">
              {queue.map((q, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Queued</span>
                  <span className="flex-1 truncate">{q}</span>
                  <button onClick={() => removeFromQueue(i)} aria-label="Remove from queue" className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="relative flex items-end gap-2 rounded-2xl border border-hairline bg-surface px-4 py-3 focus-within:border-magnolia">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
              rows={1}
              placeholder={busy ? "Queue a follow-up…" : "Message Magnolia…"}
              className="max-h-40 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {busy ? (
              <button
                onClick={() => stop()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-90"
                aria-label="Stop"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={submit} disabled={!input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-30"
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">Magnolia can make mistakes. Verify important info.</p>
        </div>
      </div>
    </>
  );
}

function Message({ message }: { message: UIMessage }) {
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">{text}</div>
      </div>
    );
  }
  return (
    <div className="prose prose-invert prose-sm max-w-none text-foreground prose-p:my-2 prose-pre:bg-surface-elevated prose-pre:border prose-pre:border-hairline prose-code:text-magnolia">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
