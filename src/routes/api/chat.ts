import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Body = { messages?: UIMessage[]; threadId?: string };

const SYSTEM_PROMPT = `You are Magnolia, the intelligent assistant at the heart of Magnolia OS — a premium ecosystem of personal apps.

Voice: warm, concise, precise. No filler. Markdown by default.
Capabilities: answer questions, draft, summarize, brainstorm, plan, code review, explain.
When asked about Magnolia OS itself, describe it as a unified ecosystem of intelligent apps under one Magnolia Account.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const messages = body.messages;
        const threadId = body.threadId;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Auth
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length);

        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUrl = process.env.SUPABASE_URL!;
        const publishable = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient(supabaseUrl, publishable, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
        if (claimsErr || !claims?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = claims.claims.sub as string;

        // Verify thread ownership
        if (threadId) {
          const { data: thread } = await supabase
            .from("assistant_threads").select("id, user_id, title").eq("id", threadId).maybeSingle();
          if (!thread || thread.user_id !== userId) {
            return new Response("Forbidden", { status: 403 });
          }
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            if (!threadId) return;
            try {
              // Persist the last user message (if not already saved) and the new assistant message.
              const lastUser = [...finalMessages].reverse().find((m) => m.role === "user");
              const lastAssistant = [...finalMessages].reverse().find((m) => m.role === "assistant");
              const inserts: Array<{ thread_id: string; role: string; parts: unknown }> = [];
              if (lastUser) inserts.push({ thread_id: threadId, role: "user", parts: lastUser.parts });
              if (lastAssistant) inserts.push({ thread_id: threadId, role: "assistant", parts: lastAssistant.parts });

              // Get existing message count to dedupe user message
              const { count } = await supabase
                .from("assistant_messages").select("*", { count: "exact", head: true }).eq("thread_id", threadId);
              const expected = finalMessages.length;
              const toInsert = inserts.slice(Math.max(0, inserts.length - (expected - (count ?? 0))));

              if (toInsert.length > 0) {
                await supabase.from("assistant_messages").insert(toInsert);
              }
              await supabase.from("assistant_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);

              // Auto-title from first user message
              if (lastUser && (count ?? 0) === 0) {
                const text = lastUser.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();
                if (text) {
                  const title = text.slice(0, 60) + (text.length > 60 ? "…" : "");
                  await supabase.from("assistant_threads").update({ title }).eq("id", threadId);
                }
              }
            } catch (e) {
              console.error("Failed to persist chat", e);
            }
          },
        });
      },
    },
  },
});
