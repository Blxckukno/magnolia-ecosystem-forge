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
import { ArrowUp, Sparkles, Square, RotateCcw, X } from "lucide-react";
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

  const { messages, sendMessage, status, stop, regenerate } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onFinish: async ({ message, isAbort }) => {
      onFirstResponse();
      if (isAbort && !cancelSavedRef.current) {
        cancelSavedRef.current = true;
        try {
          const parts = (message?.parts ?? []) as UIMessage["parts"];
          const cloned = parts.map((p) => ({ ...p })) as UIMessage["parts"];
          let lastTextIdx = -1;
          cloned.forEach((p, i) => { if (p.type === "text") lastTextIdx = i; });
          if (lastTextIdx >= 0) {
            const t = cloned[lastTextIdx] as { type: "text"; text: string };
            t.text = `${t.text}\n\n_Stopped._`;
          } else {
            cloned.push({ type: "text", text: "_Stopped._" } as never);
          }
          // Persist the in-flight user message + partial assistant message
          const allMsgs = [...messages];
          const lastUser = [...allMsgs].reverse().find((m) => m.role === "user");
          const inserts: Array<{ thread_id: string; role: string; parts: unknown }> = [];
          if (lastUser) inserts.push({ thread_id: threadId, role: "user", parts: lastUser.parts });
          inserts.push({ thread_id: threadId, role: "assistant", parts: cloned });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await supabase.from("assistant_messages").insert(inserts as any);
          await supabase.from("assistant_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
        } catch (e) {
          console.error("Failed to persist canceled message", e);
        }
      }
    },
  });

  const [input, setInput] = useState("");
  const [queue, setQueue] = useState<string[]>([]);
  const cancelSavedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (busy) cancelSavedRef.current = false;
  }, [busy]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, status]);
  useEffect(() => { textareaRef.current?.focus(); }, [threadId, busy]);

  // Drain queue when status returns to ready
  useEffect(() => {
    if (status === "ready" && queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      sendMessage({ text: next });
    }
  }, [status, queue, sendMessage]);

  function submit() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    if (busy) {
      setQueue((q) => [...q, text]);
    } else {
      sendMessage({ text });
    }
  }

  function retry() {
    if (busy) return;
    regenerate();
  }

  const empty = messages.length === 0;
  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === "assistant";

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
            {!busy && lastIsAssistant && (
              <div className="flex justify-start">
                <button onClick={retry} className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-2.5 py-1 text-xs text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-hairline bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-4">
          {queue.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {queue.map((q, i) => (
                <div key={i} className="group flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                  <span className="max-w-[200px] truncate">Queued: {q}</span>
                  <button onClick={() => setQueue((qs) => qs.filter((_, j) => j !== i))} className="opacity-60 hover:opacity-100" aria-label="Remove from queue">
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
                type="button"
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
