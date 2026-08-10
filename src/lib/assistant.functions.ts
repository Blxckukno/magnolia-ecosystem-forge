import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { throwGenericDbError } from "@/lib/assistant-errors";

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("assistant_threads")
      .select("id, title, updated_at, created_at")
      .order("updated_at", { ascending: false });
    if (error) throwGenericDbError("listThreads", error);
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ title: z.string().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("assistant_threads")
      .insert({ user_id: context.userId, title: data.title ?? "New conversation" })
      .select("id, title, updated_at, created_at")
      .single();
    if (error) throwGenericDbError("createThread", error);
    return row;
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), title: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("assistant_threads")
      .update({ title: data.title })
      .eq("id", data.id);
    if (error) throwGenericDbError("renameThread", error);
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("assistant_threads").delete().eq("id", data.id);
    if (error) throwGenericDbError("deleteThread", error);
    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("assistant_messages")
      .select("id, role, parts, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throwGenericDbError("getThreadMessages", error);
    return (rows ?? []).map((r) => ({
      id: r.id as string,
      role: r.role as "user" | "assistant" | "system",
      parts: r.parts as unknown as Array<{ type: string; text?: string }>,
    }));
  });
